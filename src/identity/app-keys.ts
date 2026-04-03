import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import appKeyIdl from "../idl/app_key_registry.json";

export enum AppKeyScope {
  Full = 0,
  TweetsOnly = 1,
  SocialOnly = 2,
  ReadOnly = 3,
}

export interface AppKeyRecord {
  tid: bigint;
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
   * Add an app key for a TID. Custody address must sign.
   */
  async addAppKey(
    tid: bigint,
    appPubkey: PublicKey,
    scope: AppKeyScope,
    expiresAt: number = 0
  ): Promise<TransactionSignature> {
    const tidRecord = this.deriveTidRecord(tid);
    const [appKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.tidToBuffer(tid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    return this.program.methods
      .addAppKey(appPubkey, scope, new BN(expiresAt))
      .accounts({
        tidRecord,
        appKeyRecord,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Revoke an app key.
   */
  async revokeAppKey(tid: bigint, appPubkey: PublicKey): Promise<TransactionSignature> {
    const tidRecord = this.deriveTidRecord(tid);
    const [appKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.tidToBuffer(tid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    return this.program.methods
      .revokeAppKey()
      .accounts({
        tidRecord,
        appKeyRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Rotate an app key (revoke old + create new atomically).
   */
  async rotateAppKey(
    tid: bigint,
    oldAppPubkey: PublicKey,
    newAppPubkey: PublicKey,
    scope: AppKeyScope,
    expiresAt: number = 0
  ): Promise<TransactionSignature> {
    const tidRecord = this.deriveTidRecord(tid);

    const [oldAppKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.tidToBuffer(tid), oldAppPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    const [newAppKeyRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.tidToBuffer(tid), newAppPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    return this.program.methods
      .rotateAppKey(newAppPubkey, scope, new BN(expiresAt))
      .accounts({
        tidRecord,
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
  async getAppKey(tid: bigint, appPubkey: PublicKey): Promise<AppKeyRecord | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.tidToBuffer(tid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    try {
      const account = await (this.program.account as any).appKeyRecord.fetch(pda);
      const data = account as any;
      return {
        tid: BigInt(data.tid.toString()),
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
