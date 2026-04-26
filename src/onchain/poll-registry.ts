import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/poll_registry.json";
import { NetworkConfig } from "../network/types";

export const MAX_POLL_OPTIONS_ONCHAIN = 8;

export interface CreatorPollState {
  creator: PublicKey;
  creatorTid: bigint;
  nextPollId: bigint;
}

export interface OnchainPoll {
  pda: PublicKey;
  creator: PublicKey;
  creatorTid: bigint;
  pollId: bigint;
  optionCount: number;
  optionVotes: number[];
  totalVotes: number;
  expiresAt: number;
  hasExpiry: boolean;
  createdAt: number;
  metadataHash: Buffer;
}

export interface OnchainVote {
  poll: PublicKey;
  voter: PublicKey;
  voterTid: bigint;
  optionIndex: number;
  votedAt: number;
}

/**
 * Anchor client for the on-chain poll-registry program. Pair with
 * the off-chain PollClient (under tribe.polls) which carries the
 * question + option labels in its POLL_ADD envelope.
 */
export class PollOnchainClient {
  private program: Program;
  private programId: PublicKey;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
    this.programId = config.programIds.pollRegistry;
  }

  /** PDA: ["poll-creator", creator_pubkey]. */
  deriveCreatorState(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("poll-creator"), creator.toBuffer()],
      this.programId
    );
  }

  /** PDA: ["poll", creator_pubkey, poll_id_le]. */
  derivePoll(creator: PublicKey, pollId: bigint): [PublicKey, number] {
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64LE(pollId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), creator.toBuffer(), idBuf],
      this.programId
    );
  }

  /** PDA: ["poll-vote", poll_pubkey, voter_pubkey]. */
  deriveVote(poll: PublicKey, voter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("poll-vote"), poll.toBuffer(), voter.toBuffer()],
      this.programId
    );
  }

  /** Idempotent. */
  async initCreatorState(creatorTid: bigint): Promise<{
    creatorState: PublicKey;
    txSig: TransactionSignature | null;
  }> {
    const creator = this.provider.wallet.publicKey;
    const [creatorState] = this.deriveCreatorState(creator);

    const existing = await this.program.provider.connection.getAccountInfo(
      creatorState
    );
    if (existing) return { creatorState, txSig: null };

    const txSig = await this.program.methods
      .initCreatorState(new BN(creatorTid.toString()))
      .accounts({
        creatorState,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { creatorState, txSig };
  }

  /**
   * Create a poll. `optionCount` must be in 2..=MAX_POLL_OPTIONS_ONCHAIN.
   * Question + option labels live in the off-chain POLL_ADD envelope
   * so only its hash is recorded on chain.
   */
  async createPoll(args: {
    optionCount: number;
    expiresAt?: number;
    metadataHash: Uint8Array;
  }): Promise<{ poll: PublicKey; pollId: bigint; txSig: TransactionSignature }> {
    if (args.optionCount < 2 || args.optionCount > MAX_POLL_OPTIONS_ONCHAIN) {
      throw new Error(
        `optionCount must be between 2 and ${MAX_POLL_OPTIONS_ONCHAIN}`
      );
    }
    if (args.metadataHash.length !== 32) {
      throw new Error("metadataHash must be exactly 32 bytes");
    }

    const creator = this.provider.wallet.publicKey;
    const [creatorState] = this.deriveCreatorState(creator);

    const state = (await (this.program.account as any).creatorPollState.fetch(
      creatorState
    )) as { nextPollId: BN };
    const pollId = BigInt(state.nextPollId.toString());

    const [poll] = this.derivePoll(creator, pollId);

    const hasExpiry = args.expiresAt !== undefined;
    const expiresAt = args.expiresAt ?? 0;

    const txSig = await this.program.methods
      .createPoll(
        args.optionCount,
        new BN(expiresAt),
        hasExpiry,
        Array.from(args.metadataHash)
      )
      .accounts({
        creatorState,
        poll,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { poll, pollId, txSig };
  }

  /** Cast a vote. The init constraint on the Vote PDA prevents re-votes. */
  async vote(args: {
    poll: PublicKey;
    voterTid: bigint;
    optionIndex: number;
  }): Promise<{ voteRecord: PublicKey; txSig: TransactionSignature }> {
    const voter = this.provider.wallet.publicKey;
    const [voteRecord] = this.deriveVote(args.poll, voter);

    const txSig = await this.program.methods
      .vote(new BN(args.voterTid.toString()), args.optionIndex)
      .accounts({
        poll: args.poll,
        voteRecord,
        voter,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { voteRecord, txSig };
  }

  async getPoll(pda: PublicKey): Promise<OnchainPoll | null> {
    try {
      const raw = (await (this.program.account as any).poll.fetch(pda)) as {
        creator: PublicKey;
        creatorTid: BN;
        pollId: BN;
        optionCount: number;
        optionVotes: number[];
        totalVotes: number;
        expiresAt: BN;
        hasExpiry: boolean;
        createdAt: BN;
        metadataHash: number[];
      };
      return {
        pda,
        creator: raw.creator,
        creatorTid: BigInt(raw.creatorTid.toString()),
        pollId: BigInt(raw.pollId.toString()),
        optionCount: raw.optionCount,
        optionVotes: raw.optionVotes.slice(0, raw.optionCount),
        totalVotes: raw.totalVotes,
        expiresAt: raw.expiresAt.toNumber(),
        hasExpiry: raw.hasExpiry,
        createdAt: raw.createdAt.toNumber(),
        metadataHash: Buffer.from(raw.metadataHash),
      };
    } catch {
      return null;
    }
  }

  async getVote(poll: PublicKey, voter: PublicKey): Promise<OnchainVote | null> {
    const [pda] = this.deriveVote(poll, voter);
    try {
      const raw = (await (this.program.account as any).vote.fetch(pda)) as {
        poll: PublicKey;
        voter: PublicKey;
        voterTid: BN;
        optionIndex: number;
        votedAt: BN;
      };
      return {
        poll: raw.poll,
        voter: raw.voter,
        voterTid: BigInt(raw.voterTid.toString()),
        optionIndex: raw.optionIndex,
        votedAt: raw.votedAt.toNumber(),
      };
    } catch {
      return null;
    }
  }
}
