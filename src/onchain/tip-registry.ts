import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/tip_registry.json";
import { NetworkConfig } from "../network/types";

/**
 * Decoded SenderTipState account.
 */
export interface SenderTipState {
  sender: PublicKey;
  senderTid: bigint;
  nextTipId: bigint;
}

/**
 * Decoded TipRecord account.
 */
export interface TipRecord {
  sender: PublicKey;
  recipient: PublicKey;
  senderTid: bigint;
  recipientTid: bigint;
  amount: bigint;
  tipId: bigint;
  createdAt: number;
  /** Empty Buffer when has_target == false. */
  targetHash: Buffer;
  hasTarget: boolean;
}

/**
 * Anchor client for the on-chain tip-registry program.
 *
 * Tips here are real lamport transfers from sender → recipient,
 * settled in the same instruction that writes the immutable
 * TipRecord PDA. Use this when you want trustless on-chain
 * settlement; for off-chain tip *signals* (no real funds moving),
 * use the hub-backed `TipClient` under `client.tips`.
 */
export class TipOnchainClient {
  private program: Program;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
  }

  /** PDA: ["tip-sender", sender_pubkey]. */
  deriveSenderState(sender: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("tip-sender"), sender.toBuffer()],
      this.config.programIds.tipRegistry
    );
  }

  /** PDA: ["tip", sender_pubkey, tip_id_le]. */
  deriveTipRecord(sender: PublicKey, tipId: bigint): [PublicKey, number] {
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64LE(tipId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("tip"), sender.toBuffer(), idBuf],
      this.config.programIds.tipRegistry
    );
  }

  /**
   * One-time per-sender setup. Idempotent — silently returns the
   * existing PDA if it already exists.
   */
  async initSenderState(senderTid: bigint): Promise<{
    senderState: PublicKey;
    txSig: TransactionSignature | null;
  }> {
    const sender = this.provider.wallet.publicKey;
    const [senderState] = this.deriveSenderState(sender);

    const existing = await this.program.provider.connection.getAccountInfo(
      senderState
    );
    if (existing) {
      return { senderState, txSig: null };
    }

    const txSig = await this.program.methods
      .initSenderState(new BN(senderTid.toString()))
      .accounts({
        senderState,
        sender,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { senderState, txSig };
  }

  /**
   * Send `amountLamports` from the connected wallet to `recipient`,
   * recording the tip on chain. Returns the freshly-written
   * TipRecord PDA so callers can fetch / display it.
   */
  async sendTip(args: {
    recipient: PublicKey;
    recipientTid: bigint;
    amountLamports: bigint;
    /** Optional content anchor (e.g. blake3 hash of a tweet). */
    targetHash?: Uint8Array;
  }): Promise<{ tipRecord: PublicKey; tipId: bigint; txSig: TransactionSignature }> {
    const sender = this.provider.wallet.publicKey;
    const [senderState] = this.deriveSenderState(sender);

    // Read the current next_tip_id so we can derive the TipRecord PDA
    // before submitting. Anchor's account decoder runs against the IDL.
    const state = (await (this.program.account as any).senderTipState.fetch(
      senderState
    )) as { nextTipId: BN };
    const tipId = BigInt(state.nextTipId.toString());

    const [tipRecord] = this.deriveTipRecord(sender, tipId);

    const targetHashArr = new Array(32).fill(0);
    const hasTarget = !!args.targetHash;
    if (hasTarget) {
      const src = args.targetHash!;
      if (src.length !== 32) {
        throw new Error("targetHash must be exactly 32 bytes");
      }
      for (let i = 0; i < 32; i++) targetHashArr[i] = src[i];
    }

    const txSig = await this.program.methods
      .sendTip(
        new BN(args.recipientTid.toString()),
        new BN(args.amountLamports.toString()),
        targetHashArr,
        hasTarget
      )
      .accounts({
        senderState,
        tipRecord,
        sender,
        recipient: args.recipient,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { tipRecord, tipId, txSig };
  }

  /** Read a TipRecord by PDA address. Returns null if missing. */
  async getTip(pda: PublicKey): Promise<TipRecord | null> {
    try {
      const raw = (await (this.program.account as any).tipRecord.fetch(pda)) as {
        sender: PublicKey;
        recipient: PublicKey;
        senderTid: BN;
        recipientTid: BN;
        amount: BN;
        tipId: BN;
        createdAt: BN;
        targetHash: number[];
        hasTarget: boolean;
      };
      return {
        sender: raw.sender,
        recipient: raw.recipient,
        senderTid: BigInt(raw.senderTid.toString()),
        recipientTid: BigInt(raw.recipientTid.toString()),
        amount: BigInt(raw.amount.toString()),
        tipId: BigInt(raw.tipId.toString()),
        createdAt: raw.createdAt.toNumber(),
        targetHash: Buffer.from(raw.targetHash),
        hasTarget: raw.hasTarget,
      };
    } catch {
      return null;
    }
  }

  /** Read the per-sender counter / wallet binding. */
  async getSenderState(sender: PublicKey): Promise<SenderTipState | null> {
    const [pda] = this.deriveSenderState(sender);
    try {
      const raw = (await (this.program.account as any).senderTipState.fetch(
        pda
      )) as { sender: PublicKey; senderTid: BN; nextTipId: BN };
      return {
        sender: raw.sender,
        senderTid: BigInt(raw.senderTid.toString()),
        nextTipId: BigInt(raw.nextTipId.toString()),
      };
    } catch {
      return null;
    }
  }
}
