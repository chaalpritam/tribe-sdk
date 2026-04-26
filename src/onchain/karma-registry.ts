import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/karma_registry.json";
import { NetworkConfig } from "../network/types";

export interface KarmaAccount {
  pda: PublicKey;
  tid: bigint;
  tipsReceivedCount: bigint;
  tipsReceivedLamports: bigint;
  tasksCompletedCount: bigint;
  tasksCompletedRewardLamports: bigint;
}

export enum KarmaProofKind {
  Tip = 1,
  Task = 2,
}

export interface KarmaProof {
  source: PublicKey;
  kind: KarmaProofKind;
  tid: bigint;
}

/**
 * Anchor client for the on-chain karma-registry program.
 *
 * Karma is aggregated trustlessly from existing on-chain receipts:
 * a `KarmaProof` PDA seeded by the source record's pubkey serves as
 * a one-shot guard that the same TipRecord or completed Task can't
 * be credited twice.
 */
export class KarmaOnchainClient {
  private program: Program;
  private programId: PublicKey;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
    this.programId = config.programIds.karmaRegistry;
  }

  /** PDA: ["karma", tid_le]. */
  deriveKarma(tid: bigint): [PublicKey, number] {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(tid);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("karma"), buf],
      this.programId
    );
  }

  /** PDA: ["karma-proof", source_record_pubkey]. */
  deriveProof(source: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("karma-proof"), source.toBuffer()],
      this.programId
    );
  }

  /**
   * One-time per TID. Anyone can fund it. Idempotent.
   */
  async initKarmaAccount(tid: bigint): Promise<{
    karma: PublicKey;
    txSig: TransactionSignature | null;
  }> {
    const [karma] = this.deriveKarma(tid);
    const existing = await this.program.provider.connection.getAccountInfo(karma);
    if (existing) return { karma, txSig: null };

    const txSig = await this.program.methods
      .initKarmaAccount(new BN(tid.toString()))
      .accounts({
        karma,
        payer: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { karma, txSig };
  }

  /**
   * Credit a tip the recipient received. Reads the TipRecord PDA on
   * chain to verify recipient_tid; double-counting is blocked by
   * the per-tip KarmaProof PDA.
   */
  async recordTipReceived(args: {
    /** Recipient's karma account TID. */
    recipientTid: bigint;
    /** TipRecord PDA from tip-registry. */
    tipRecord: PublicKey;
  }): Promise<{ karma: PublicKey; karmaProof: PublicKey; txSig: TransactionSignature }> {
    const [karma] = this.deriveKarma(args.recipientTid);
    const [karmaProof] = this.deriveProof(args.tipRecord);

    const txSig = await this.program.methods
      .recordTipReceived()
      .accounts({
        karma,
        tipRecord: args.tipRecord,
        karmaProof,
        payer: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { karma, karmaProof, txSig };
  }

  /**
   * Credit a completed task. Reads the Task PDA on chain to verify
   * status == Completed and claimer_tid; same per-task KarmaProof
   * double-count protection.
   */
  async recordTaskCompleted(args: {
    /** Claimer's karma account TID. */
    claimerTid: bigint;
    /** Task PDA from task-registry. */
    task: PublicKey;
  }): Promise<{ karma: PublicKey; karmaProof: PublicKey; txSig: TransactionSignature }> {
    const [karma] = this.deriveKarma(args.claimerTid);
    const [karmaProof] = this.deriveProof(args.task);

    const txSig = await this.program.methods
      .recordTaskCompleted()
      .accounts({
        karma,
        task: args.task,
        karmaProof,
        payer: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { karma, karmaProof, txSig };
  }

  async getKarma(tid: bigint): Promise<KarmaAccount | null> {
    const [pda] = this.deriveKarma(tid);
    try {
      const raw = (await (this.program.account as any).karmaAccount.fetch(
        pda
      )) as {
        tid: BN;
        tipsReceivedCount: BN;
        tipsReceivedLamports: BN;
        tasksCompletedCount: BN;
        tasksCompletedRewardLamports: BN;
      };
      return {
        pda,
        tid: BigInt(raw.tid.toString()),
        tipsReceivedCount: BigInt(raw.tipsReceivedCount.toString()),
        tipsReceivedLamports: BigInt(raw.tipsReceivedLamports.toString()),
        tasksCompletedCount: BigInt(raw.tasksCompletedCount.toString()),
        tasksCompletedRewardLamports: BigInt(
          raw.tasksCompletedRewardLamports.toString()
        ),
      };
    } catch {
      return null;
    }
  }

  /** Convenience: has a given source record already been credited? */
  async hasProof(source: PublicKey): Promise<boolean> {
    const [pda] = this.deriveProof(source);
    const info = await this.program.provider.connection.getAccountInfo(pda);
    return info !== null;
  }
}
