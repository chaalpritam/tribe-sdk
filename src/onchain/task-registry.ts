import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/task_registry.json";
import { NetworkConfig } from "../network/types";

export enum OnchainTaskStatus {
  Open = 0,
  Claimed = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface CreatorTaskState {
  creator: PublicKey;
  creatorTid: bigint;
  nextTaskId: bigint;
}

export interface Task {
  pda: PublicKey;
  creator: PublicKey;
  creatorTid: bigint;
  taskId: bigint;
  status: OnchainTaskStatus;
  rewardAmount: bigint;
  claimer: PublicKey;
  claimerTid: bigint;
  hasClaimer: boolean;
  createdAt: number;
  claimedAt: number;
  completedAt: number;
  metadataHash: Buffer;
}

/**
 * Anchor client for the on-chain task-registry program.
 * Pair with the off-chain TaskClient (under tribe.tasks) which
 * publishes the TASK_ADD envelope (title / description / reward_text)
 * — those fields aren't stored on chain, only their hash.
 */
export class TaskOnchainClient {
  private program: Program;
  private programId: PublicKey;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
    this.programId = config.programIds.taskRegistry;
  }

  /** PDA: ["task-creator", creator_pubkey]. */
  deriveCreatorState(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("task-creator"), creator.toBuffer()],
      this.programId
    );
  }

  /** PDA: ["task", creator_pubkey, task_id_le]. */
  deriveTask(creator: PublicKey, taskId: bigint): [PublicKey, number] {
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64LE(taskId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("task"), creator.toBuffer(), idBuf],
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

  /** Create a new task; escrows `rewardAmountLamports` if > 0. */
  async createTask(args: {
    rewardAmountLamports: bigint;
    /** Hash of the off-chain TASK_ADD envelope. */
    metadataHash: Uint8Array;
  }): Promise<{ task: PublicKey; taskId: bigint; txSig: TransactionSignature }> {
    const creator = this.provider.wallet.publicKey;
    const [creatorState] = this.deriveCreatorState(creator);

    const state = (await (this.program.account as any).creatorTaskState.fetch(
      creatorState
    )) as { nextTaskId: BN };
    const taskId = BigInt(state.nextTaskId.toString());

    const [task] = this.deriveTask(creator, taskId);

    if (args.metadataHash.length !== 32) {
      throw new Error("metadataHash must be exactly 32 bytes");
    }

    const txSig = await this.program.methods
      .createTask(
        new BN(args.rewardAmountLamports.toString()),
        Array.from(args.metadataHash)
      )
      .accounts({
        creatorState,
        task,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { task, taskId, txSig };
  }

  /** Claim an open task. Cannot be the creator. */
  async claimTask(task: PublicKey, claimerTid: bigint): Promise<TransactionSignature> {
    const claimer = this.provider.wallet.publicKey;
    return this.program.methods
      .claimTask(new BN(claimerTid.toString()))
      .accounts({
        task,
        claimer,
      })
      .rpc();
  }

  /**
   * Mark complete and release escrow to the claimer. Creator-only.
   * The current claimer pubkey is read from the on-chain Task; if it
   * doesn't match the expected claimer, the program rejects.
   */
  async completeTask(task: PublicKey, claimer: PublicKey): Promise<TransactionSignature> {
    const creator = this.provider.wallet.publicKey;
    return this.program.methods
      .completeTask()
      .accounts({
        task,
        claimer,
        creator,
      })
      .rpc();
  }

  /** Cancel an Open task. Creator-only. Refunds the escrow. */
  async cancelTask(task: PublicKey): Promise<TransactionSignature> {
    const creator = this.provider.wallet.publicKey;
    return this.program.methods
      .cancelTask()
      .accounts({
        task,
        creator,
      })
      .rpc();
  }

  async getTask(pda: PublicKey): Promise<Task | null> {
    try {
      const raw = (await (this.program.account as any).task.fetch(pda)) as {
        creator: PublicKey;
        creatorTid: BN;
        taskId: BN;
        status: number;
        rewardAmount: BN;
        claimer: PublicKey;
        claimerTid: BN;
        hasClaimer: boolean;
        createdAt: BN;
        claimedAt: BN;
        completedAt: BN;
        metadataHash: number[];
      };
      return {
        pda,
        creator: raw.creator,
        creatorTid: BigInt(raw.creatorTid.toString()),
        taskId: BigInt(raw.taskId.toString()),
        status: raw.status as OnchainTaskStatus,
        rewardAmount: BigInt(raw.rewardAmount.toString()),
        claimer: raw.claimer,
        claimerTid: BigInt(raw.claimerTid.toString()),
        hasClaimer: raw.hasClaimer,
        createdAt: raw.createdAt.toNumber(),
        claimedAt: raw.claimedAt.toNumber(),
        completedAt: raw.completedAt.toNumber(),
        metadataHash: Buffer.from(raw.metadataHash),
      };
    } catch {
      return null;
    }
  }

  async getCreatorState(creator: PublicKey): Promise<CreatorTaskState | null> {
    const [pda] = this.deriveCreatorState(creator);
    try {
      const raw = (await (this.program.account as any).creatorTaskState.fetch(
        pda
      )) as { creator: PublicKey; creatorTid: BN; nextTaskId: BN };
      return {
        creator: raw.creator,
        creatorTid: BigInt(raw.creatorTid.toString()),
        nextTaskId: BigInt(raw.nextTaskId.toString()),
      };
    } catch {
      return null;
    }
  }
}
