import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { ExecutionProvider, SocialProfile, Link } from "./types";
import { NetworkConfig } from "../network/types";

/**
 * DirectSolanaProvider — sends social graph operations directly to Solana.
 *
 * This is the prototype implementation. When an Ephemeral Rollup is built,
 * a new EphemeralRollupProvider will implement the same interface.
 */
export class DirectSolanaProvider implements ExecutionProvider {
  private connection: Connection;
  private provider: AnchorProvider;
  private config: NetworkConfig;

  constructor(provider: AnchorProvider, config: NetworkConfig) {
    this.provider = provider;
    this.connection = provider.connection;
    this.config = config;
  }

  async follow(followerFid: bigint, followingFid: bigint): Promise<string> {
    // TODO: Build and send follow instruction to social-graph program
    // 1. Derive follower's FidRecord PDA
    // 2. Derive follower and following SocialProfile PDAs
    // 3. Derive Link PDA from ["link", followerFid, followingFid]
    // 4. Send follow instruction
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  async unfollow(followerFid: bigint, followingFid: bigint): Promise<string> {
    // TODO: Build and send unfollow instruction to social-graph program
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  async getLink(followerFid: bigint, followingFid: bigint): Promise<Link | null> {
    const [linkPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("link"),
        this.fidToBuffer(followerFid),
        this.fidToBuffer(followingFid),
      ],
      this.config.programIds.socialGraph
    );

    const accountInfo = await this.connection.getAccountInfo(linkPda);
    if (!accountInfo) return null;

    // TODO: Deserialize Link account data using IDL
    return {
      followerFid,
      followingFid,
      createdAt: 0, // placeholder
    };
  }

  async getProfile(fid: bigint): Promise<SocialProfile | null> {
    const [profilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.fidToBuffer(fid)],
      this.config.programIds.socialGraph
    );

    const accountInfo = await this.connection.getAccountInfo(profilePda);
    if (!accountInfo) return null;

    // TODO: Deserialize SocialProfile account data using IDL
    return {
      fid,
      followingCount: 0,
      followersCount: 0,
    };
  }

  private fidToBuffer(fid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(fid);
    return buf;
  }
}
