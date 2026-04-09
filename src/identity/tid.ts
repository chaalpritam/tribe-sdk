import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import idl from "../idl/tid_registry.json";

export interface TidRecord {
  tid: bigint;
  custodyAddress: PublicKey;
  recoveryAddress: PublicKey;
  registeredAt: number;
}

export class TidClient {
  private program: Program;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
  }

  /**
   * Register a new TID for the connected wallet.
   */
  async register(recoveryAddress: PublicKey): Promise<{ tid: bigint; txSig: string }> {
    // Check if this wallet already has a TID registered
    const existingTid = await this.getTidByCustody(this.provider.wallet.publicKey);
    if (existingTid !== null) {
      throw new Error(
        `Wallet ${this.provider.wallet.publicKey.toBase58()} already has TID #${existingTid} registered. Each wallet can only register one TID.`
      );
    }

    // Read current tid counter to derive the TidRecord PDA
    const [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      this.config.programIds.tidRegistry
    );

    const state = await (this.program.account as any).globalState.fetch(globalState);
    const nextTid = ((state as any).tidCounter as BN).add(new BN(1));

    const [tidRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), nextTid.toArrayLike(Buffer, "le", 8)],
      this.config.programIds.tidRegistry
    );

    const [custodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), this.provider.wallet.publicKey.toBuffer()],
      this.config.programIds.tidRegistry
    );

    const txSig = await this.program.methods
      .register(recoveryAddress)
      .accounts({
        globalState,
        tidRecord,
        custodyLookup,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { tid: BigInt(nextTid.toString()), txSig };
  }

  /**
   * Transfer TID custody to a new wallet.
   */
  async transfer(tid: bigint, newCustody: PublicKey): Promise<TransactionSignature> {
    const [tidRecord] = this.deriveTidRecord(tid);

    const [oldCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), this.provider.wallet.publicKey.toBuffer()],
      this.config.programIds.tidRegistry
    );

    const [newCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), newCustody.toBuffer()],
      this.config.programIds.tidRegistry
    );

    return this.program.methods
      .transfer(newCustody)
      .accounts({
        tidRecord,
        oldCustodyLookup,
        newCustodyLookup,
        newCustody,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Recover TID using the recovery address.
   */
  async recover(tid: bigint, newCustody: PublicKey): Promise<TransactionSignature> {
    const [tidRecord] = this.deriveTidRecord(tid);

    // Fetch current custody to derive old lookup PDA
    const record = await (this.program.account as any).tidRecord.fetch(tidRecord);
    const oldCustodyAddress = (record as any).custodyAddress as PublicKey;

    const [oldCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), oldCustodyAddress.toBuffer()],
      this.config.programIds.tidRegistry
    );

    const [newCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), newCustody.toBuffer()],
      this.config.programIds.tidRegistry
    );

    return this.program.methods
      .recover(newCustody)
      .accounts({
        tidRecord,
        oldCustodyLookup,
        newCustodyLookup,
        newCustody,
        recovery: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Change the recovery address for a TID.
   */
  async changeRecovery(tid: bigint, newRecovery: PublicKey): Promise<TransactionSignature> {
    const [tidRecord] = this.deriveTidRecord(tid);

    return this.program.methods
      .changeRecovery(newRecovery)
      .accounts({
        tidRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Fetch a TID record by TID number.
   */
  async getTid(tid: bigint): Promise<TidRecord | null> {
    const [pda] = this.deriveTidRecord(tid);

    try {
      const account = await (this.program.account as any).tidRecord.fetch(pda);
      const data = account as any;
      return {
        tid: BigInt(data.tid.toString()),
        custodyAddress: data.custodyAddress,
        recoveryAddress: data.recoveryAddress,
        registeredAt: (data.registeredAt as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Look up a TID by custody address.
   */
  async getTidByCustody(custodyAddress: PublicKey): Promise<bigint | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), custodyAddress.toBuffer()],
      this.config.programIds.tidRegistry
    );

    try {
      const account = await (this.program.account as any).custodyLookup.fetch(pda);
      return BigInt((account as any).tid.toString());
    } catch {
      return null;
    }
  }

  private deriveTidRecord(tid: bigint): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), this.tidToBuffer(tid)],
      this.config.programIds.tidRegistry
    );
  }

  private tidToBuffer(tid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(tid);
    return buf;
  }
}
