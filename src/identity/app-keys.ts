import { PublicKey, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";

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
  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {}

  /**
   * Add an app key for an FID. Custody address must sign.
   */
  async addAppKey(
    fid: bigint,
    appPubkey: PublicKey,
    scope: AppKeyScope,
    expiresAt: number = 0
  ): Promise<TransactionSignature> {
    // TODO: Call app_key_registry.add_app_key(app_pubkey, scope, expires_at)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Revoke an app key.
   */
  async revokeAppKey(fid: bigint, appPubkey: PublicKey): Promise<TransactionSignature> {
    // TODO: Call app_key_registry.revoke_app_key()
    throw new Error("Not implemented — requires IDL from anchor build");
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
    // TODO: Call app_key_registry.rotate_app_key(new_app_pubkey, scope, expires_at)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Fetch an app key record.
   */
  async getAppKey(fid: bigint, appPubkey: PublicKey): Promise<AppKeyRecord | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), this.fidToBuffer(fid), appPubkey.toBuffer()],
      this.config.programIds.appKeyRegistry
    );

    const accountInfo = await this.provider.connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    // TODO: Deserialize using IDL types
    return null;
  }

  private fidToBuffer(fid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(fid);
    return buf;
  }
}
