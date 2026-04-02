import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import usernameIdl from "../idl/username_registry.json";

export interface UsernameRecord {
  username: string;
  fid: bigint;
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
   * Register a username for an FID.
   */
  async register(fid: bigint, username: string): Promise<TransactionSignature> {
    const fidRecord = this.deriveFidRecord(fid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    const [fidUsername] = PublicKey.findProgramAddressSync(
      [Buffer.from("fid_username"), this.fidToBuffer(fid)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .registerUsername(username)
      .accounts({
        fidRecord,
        usernameRecord,
        fidUsername,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Renew a username (extend expiry by 1 year).
   */
  async renew(fid: bigint, username: string): Promise<TransactionSignature> {
    const fidRecord = this.deriveFidRecord(fid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .renewUsername()
      .accounts({
        fidRecord,
        usernameRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Transfer a username to a different FID.
   */
  async transfer(username: string, newFid: bigint): Promise<TransactionSignature> {
    // Fetch current owner's FID from the username record
    const record = await this.getUsername(username);
    if (!record) throw new Error(`Username "${username}" not found`);

    const fidRecord = this.deriveFidRecord(record.fid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .transferUsername(new BN(newFid.toString()))
      .accounts({
        fidRecord,
        usernameRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Release a username (close account, reclaim rent).
   */
  async release(fid: bigint, username: string): Promise<TransactionSignature> {
    const fidRecord = this.deriveFidRecord(fid);

    const [usernameRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      this.config.programIds.usernameRegistry
    );

    const [fidUsername] = PublicKey.findProgramAddressSync(
      [Buffer.from("fid_username"), this.fidToBuffer(fid)],
      this.config.programIds.usernameRegistry
    );

    return this.program.methods
      .releaseUsername()
      .accounts({
        fidRecord,
        usernameRecord,
        fidUsername,
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
        fid: BigInt(data.fid.toString()),
        registeredAt: (data.registeredAt as BN).toNumber(),
        expiry: (data.expiry as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }

  private deriveFidRecord(fid: bigint): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fid"), this.fidToBuffer(fid)],
      this.config.programIds.fidRegistry
    );
    return pda;
  }

  private fidToBuffer(fid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(fid);
    return buf;
  }
}
