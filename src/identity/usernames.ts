import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import usernameIdl from "../idl/username_registry.json";

export interface UsernameRecord {
  username: string;
  tid: bigint;
  registeredAt: number;
  expiry: number;
}

export class UsernameClient {
  private program: Program;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(usernameIdl as any, provider);
  }

  /**
   * Register a username for a TID.
   */
  async register(tid: bigint, username: string): Promise<TransactionSignature> {
    const tidRecord = this.deriveTidRecord(tid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    const [tidUsername] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid_username"), this.tidToBuffer(tid)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .registerUsername(username)
      .accounts({
        tidRecord,
        usernameRecord,
        tidUsername,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Renew a username (extend expiry by 1 year).
   */
  async renew(tid: bigint, username: string): Promise<TransactionSignature> {
    const tidRecord = this.deriveTidRecord(tid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .renewUsername()
      .accounts({
        tidRecord,
        usernameRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Transfer a username to a different TID.
   */
  async transfer(username: string, newTid: bigint): Promise<TransactionSignature> {
    // Fetch current owner's TID from the username record
    const record = await this.getUsername(username);
    if (!record) throw new Error(`Username "${username}" not found`);

    const tidRecord = this.deriveTidRecord(record.tid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .transferUsername(new BN(newTid.toString()))
      .accounts({
        tidRecord,
        usernameRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Release a username (close account, reclaim rent).
   */
  async release(tid: bigint, username: string): Promise<TransactionSignature> {
    const tidRecord = this.deriveTidRecord(tid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    const [tidUsername] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid_username"), this.tidToBuffer(tid)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .releaseUsername()
      .accounts({
        tidRecord,
        usernameRecord,
        tidUsername,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Look up a username record.
   */
  async getUsername(username: string): Promise<UsernameRecord | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    try {
      const account = await (this.program.account as any).usernameRecord.fetch(pda);
      const data = account as any;
      // Decode fixed-size username array
      const usernameBytes = data.username as number[];
      const usernameLen = data.usernameLen as number;
      const decodedUsername = Buffer.from(usernameBytes.slice(0, usernameLen)).toString("utf-8");

      return {
        username: decodedUsername,
        tid: BigInt(data.tid.toString()),
        registeredAt: (data.registeredAt as BN).toNumber(),
        expiry: (data.expiry as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }

  private deriveTidRecord(tid: bigint): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), this.tidToBuffer(tid)],
      this.config.programIds.tidRegistry
    );
    return pda;
  }

  private tidToBuffer(tid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(tid);
    return buf;
  }
}
