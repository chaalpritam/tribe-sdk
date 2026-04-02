import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import appKeyIdl from "../idl/app_key_registry.json";

export enum AppKeyScope {
  Full = 0,
  CastsOnly = 1,
  SocialOnly = 2,
  ReadOnly = 3,
}

export interface AppKeyRecord {
  fid: bigint;
  appPubkey: PublicKey;
  scope: AppKeyScope;
  createdAt: number;
  expiresAt: number;
  revoked: boolean;
}

export class AppKeyClient {
  private program: Program;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(appKeyIdl as any, provider);
  }

  /**
   * Add an app key for an FID. Custody address must sign.
   */
  async addAppKey(
    fid: bigint,
    appPubkey: PublicKey,
    scope: AppKeyScope,
    expiresAt: number = 0
  ): Promise<TransactionSignature> {
    const fidRecord = this.deriveFidRecord(fid);
    const [appKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.fidToBuffer(fid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    return this.program.methods
      .addAppKey(appPubkey, scope, new BN(expiresAt))
      .accounts({
        fidRecord,
        appKeyRecord,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Revoke an app key.
   */
  async revokeAppKey(fid: bigint, appPubkey: PublicKey): Promise<TransactionSignature> {
    const fidRecord = this.deriveFidRecord(fid);
    const [appKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.fidToBuffer(fid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    return this.program.methods
      .revokeAppKey()
      .accounts({
        fidRecord,
        appKeyRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Rotate an app key (revoke old + create new atomically).
   */
  async rotateAppKey(
    fid: bigint,
    oldAppPubkey: PublicKey,
    newAppPubkey: PublicKey,
    scope: AppKeyScope,
    expiresAt: number = 0
  ): Promise<TransactionSignature> {
    const fidRecord = this.deriveFidRecord(fid);

    const [oldAppKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.fidToBuffer(fid), oldAppPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    const [newAppKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.fidToBuffer(fid), newAppPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    return this.program.methods
      .rotateAppKey(newAppPubkey, scope, new BN(expiresAt))
      .accounts({
        fidRecord,
        oldAppKeyRecord,
        newAppKeyRecord,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Fetch an app key record.
   */
  async getAppKey(fid: bigint, appPubkey: PublicKey): Promise<AppKeyRecord | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.fidToBuffer(fid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    try {
      const account = await (this.program.account as any).appKeyRecord.fetch(pda);
      const data = account as any;
      return {
        fid: BigInt(data.fid.toString()),
        appPubkey: data.appPubkey,
        scope: data.scope as AppKeyScope,
        createdAt: (data.createdAt as BN).toNumber(),
        expiresAt: (data.expiresAt as BN).toNumber(),
        revoked: data.revoked,
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
