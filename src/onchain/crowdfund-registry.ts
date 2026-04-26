import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/crowdfund_registry.json";
import { NetworkConfig } from "../network/types";

export enum CrowdfundStatus {
  Active = 0,
  Succeeded = 1,
  Failed = 2,
}

export interface CreatorCrowdfundState {
  creator: PublicKey;
  creatorTid: bigint;
  nextCrowdfundId: bigint;
}

export interface Crowdfund {
  pda: PublicKey;
  creator: PublicKey;
  creatorTid: bigint;
  crowdfundId: bigint;
  goalAmount: bigint;
  totalPledged: bigint;
  pledgeCount: number;
  deadlineAt: number;
  createdAt: number;
  status: CrowdfundStatus;
  metadataHash: Buffer;
}

export interface Pledge {
  crowdfund: PublicKey;
  backer: PublicKey;
  backerTid: bigint;
  amount: bigint;
  pledgedAt: number;
}

/**
 * Anchor client for the on-chain crowdfund-registry program.
 * Pair this with the off-chain `CrowdfundClient` (under `tribe.crowdfunds`)
 * — that one publishes the CROWDFUND_ADD envelope (title / description /
 * image_url) so apps can render the campaign without a second RPC.
 */
export class CrowdfundOnchainClient {
  private program: Program;
  private programId: PublicKey;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
    this.programId = config.programIds.crowdfundRegistry;
  }

  /** PDA: ["cf-creator", creator_pubkey]. */
  deriveCreatorState(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("cf-creator"), creator.toBuffer()],
      this.programId
    );
  }

  /** PDA: ["crowdfund", creator_pubkey, crowdfund_id_le]. */
  deriveCrowdfund(creator: PublicKey, crowdfundId: bigint): [PublicKey, number] {
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64LE(crowdfundId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("crowdfund"), creator.toBuffer(), idBuf],
      this.programId
    );
  }

  /** PDA: ["pledge", crowdfund_pubkey, backer_pubkey]. */
  derivePledge(crowdfund: PublicKey, backer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("pledge"), crowdfund.toBuffer(), backer.toBuffer()],
      this.programId
    );
  }

  /** Idempotent. Returns the creator state PDA (txSig = null on hit). */
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
   * Create a new campaign. Returns the freshly-allocated Crowdfund PDA
   * so callers can derive the URL or display it without a follow-up
   * fetch.
   */
  async createCrowdfund(args: {
    goalAmountLamports: bigint;
    deadlineAtUnix: number;
    /** Hash of the off-chain CROWDFUND_ADD envelope. */
    metadataHash: Uint8Array;
  }): Promise<{ crowdfund: PublicKey; crowdfundId: bigint; txSig: TransactionSignature }> {
    const creator = this.provider.wallet.publicKey;
    const [creatorState] = this.deriveCreatorState(creator);

    const state = (await (this.program.account as any).creatorCrowdfundState.fetch(
      creatorState
    )) as { nextCrowdfundId: BN };
    const crowdfundId = BigInt(state.nextCrowdfundId.toString());

    const [crowdfund] = this.deriveCrowdfund(creator, crowdfundId);

    if (args.metadataHash.length !== 32) {
      throw new Error("metadataHash must be exactly 32 bytes");
    }

    const txSig = await this.program.methods
      .createCrowdfund(
        new BN(args.goalAmountLamports.toString()),
        new BN(args.deadlineAtUnix),
        Array.from(args.metadataHash)
      )
      .accounts({
        creatorState,
        crowdfund,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { crowdfund, crowdfundId, txSig };
  }

  /** Pledge to an existing campaign. Idempotent in the sense that re-pledges accumulate. */
  async pledge(args: {
    crowdfund: PublicKey;
    backerTid: bigint;
    amountLamports: bigint;
  }): Promise<{ pledge: PublicKey; txSig: TransactionSignature }> {
    const backer = this.provider.wallet.publicKey;
    const [pledge] = this.derivePledge(args.crowdfund, backer);

    const txSig = await this.program.methods
      .pledge(new BN(args.backerTid.toString()), new BN(args.amountLamports.toString()))
      .accounts({
        crowdfund: args.crowdfund,
        pledge,
        backer,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { pledge, txSig };
  }

  /** Sweep the vault on success. Creator-only; deadline must have passed. */
  async claimFunds(crowdfund: PublicKey): Promise<TransactionSignature> {
    const creator = this.provider.wallet.publicKey;
    return this.program.methods
      .claimFunds()
      .accounts({
        crowdfund,
        creator,
      })
      .rpc();
  }

  /** Backer refund on failure. Closes the Pledge PDA and returns its rent too. */
  async refund(crowdfund: PublicKey): Promise<TransactionSignature> {
    const backer = this.provider.wallet.publicKey;
    const [pledge] = this.derivePledge(crowdfund, backer);
    return this.program.methods
      .refund()
      .accounts({
        crowdfund,
        pledge,
        backer,
      })
      .rpc();
  }

  async getCrowdfund(pda: PublicKey): Promise<Crowdfund | null> {
    try {
      const raw = (await (this.program.account as any).crowdfund.fetch(pda)) as {
        creator: PublicKey;
        creatorTid: BN;
        crowdfundId: BN;
        goalAmount: BN;
        totalPledged: BN;
        pledgeCount: number;
        deadlineAt: BN;
        createdAt: BN;
        status: number;
        metadataHash: number[];
      };
      return {
        pda,
        creator: raw.creator,
        creatorTid: BigInt(raw.creatorTid.toString()),
        crowdfundId: BigInt(raw.crowdfundId.toString()),
        goalAmount: BigInt(raw.goalAmount.toString()),
        totalPledged: BigInt(raw.totalPledged.toString()),
        pledgeCount: raw.pledgeCount,
        deadlineAt: raw.deadlineAt.toNumber(),
        createdAt: raw.createdAt.toNumber(),
        status: raw.status as CrowdfundStatus,
        metadataHash: Buffer.from(raw.metadataHash),
      };
    } catch {
      return null;
    }
  }

  async getPledge(crowdfund: PublicKey, backer: PublicKey): Promise<Pledge | null> {
    const [pda] = this.derivePledge(crowdfund, backer);
    try {
      const raw = (await (this.program.account as any).pledge.fetch(pda)) as {
        crowdfund: PublicKey;
        backer: PublicKey;
        backerTid: BN;
        amount: BN;
        pledgedAt: BN;
      };
      return {
        crowdfund: raw.crowdfund,
        backer: raw.backer,
        backerTid: BigInt(raw.backerTid.toString()),
        amount: BigInt(raw.amount.toString()),
        pledgedAt: raw.pledgedAt.toNumber(),
      };
    } catch {
      return null;
    }
  }

  async getCreatorState(creator: PublicKey): Promise<CreatorCrowdfundState | null> {
    const [pda] = this.deriveCreatorState(creator);
    try {
      const raw = (await (this.program.account as any).creatorCrowdfundState.fetch(
        pda
      )) as { creator: PublicKey; creatorTid: BN; nextCrowdfundId: BN };
      return {
        creator: raw.creator,
        creatorTid: BigInt(raw.creatorTid.toString()),
        nextCrowdfundId: BigInt(raw.nextCrowdfundId.toString()),
      };
    } catch {
      return null;
    }
  }
}
