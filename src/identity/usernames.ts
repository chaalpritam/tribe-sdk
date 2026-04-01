import { PublicKey, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";

export interface UsernameRecord {
  username: string;
  fid: bigint;
  registeredAt: number;
  expiry: number;
}

export class UsernameClient {
  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {}

  /**
   * Register a username for an FID.
   */
  async register(fid: bigint, username: string): Promise<TransactionSignature> {
    // TODO: Call username_registry.register_username(username)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Renew a username (extend expiry by 1 year).
   */
  async renew(fid: bigint, username: string): Promise<TransactionSignature> {
    // TODO: Call username_registry.renew_username()
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Transfer a username to a different FID.
   */
  async transfer(username: string, newFid: bigint): Promise<TransactionSignature> {
    // TODO: Call username_registry.transfer_username(new_fid)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Release a username (close account, reclaim rent).
   */
  async release(fid: bigint, username: string): Promise<TransactionSignature> {
    // TODO: Call username_registry.release_username()
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Look up a username record.
   */
  async getUsername(username: string): Promise<UsernameRecord | null> {
    const usernameHash = Buffer.from(username.toLowerCase());
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), usernameHash],
      this.config.programIds.usernameRegistry
    );

    const accountInfo = await this.provider.connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    // TODO: Deserialize using IDL types
    return null;
  }
}
