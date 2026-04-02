import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { ExecutionProvider, SocialProfile, Link } from "./types";
import { NetworkConfig } from "../network/types";
import socialGraphIdl from "../idl/social_graph.json";

/**
 * DirectSolanaProvider — sends social graph operations directly to Solana.
 *
 * This is the prototype implementation. When an Ephemeral Rollup is built,
 * a new EphemeralRollupProvider will implement the same interface.
 */
export class DirectSolanaProvider implements ExecutionProvider {
  private program: Program;
  private config: NetworkConfig;
  private provider: AnchorProvider;

  constructor(provider: AnchorProvider, config: NetworkConfig) {
    this.provider = provider;
    this.config = config;
    this.program = new Program(socialGraphIdl as any, provider);
  }

  async follow(followerFid: bigint, followingFid: bigint): Promise<string> {
    const followerFidRecord = this.deriveFidRecord(followerFid);

    const [followerProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.fidToBuffer(followerFid)],
      this.config.programIds.socialGraph
    );

    const [followingProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.fidToBuffer(followingFid)],
      this.config.programIds.socialGraph
    );

    const [link] = PublicKey.findProgramAddressSync(
      [Buffer.from("link"), this.fidToBuffer(followerFid), this.fidToBuffer(followingFid)],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .follow()
      .accounts({
        followerFidRecord,
        followerProfile,
        followingProfile,
        link,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async unfollow(followerFid: bigint, followingFid: bigint): Promise<string> {
    const followerFidRecord = this.deriveFidRecord(followerFid);

    const [followerProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.fidToBuffer(followerFid)],
      this.config.programIds.socialGraph
    );

    const [followingProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.fidToBuffer(followingFid)],
      this.config.programIds.socialGraph
    );

    const [link] = PublicKey.findProgramAddressSync(
      [Buffer.from("link"), this.fidToBuffer(followerFid), this.fidToBuffer(followingFid)],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .unfollow()
      .accounts({
        followerFidRecord,
        followerProfile,
        followingProfile,
        link,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  async getLink(followerFid: bigint, followingFid: bigint): Promise<Link | null> {
    const [linkPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("link"), this.fidToBuffer(followerFid), this.fidToBuffer(followingFid)],
      this.config.programIds.socialGraph
    );

    try {
      const account = await (this.program.account as any).link.fetch(linkPda);
      const data = account as any;
      return {
        followerFid: BigInt(data.followerFid.toString()),
        followingFid: BigInt(data.followingFid.toString()),
        createdAt: (data.createdAt as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }

  async getProfile(fid: bigint): Promise<SocialProfile | null> {
    const [profilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.fidToBuffer(fid)],
      this.config.programIds.socialGraph
    );

    try {
      const account = await (this.program.account as any).socialProfile.fetch(profilePda);
      const data = account as any;
      return {
        fid: BigInt(data.fid.toString()),
        followingCount: data.followingCount,
        followersCount: data.followersCount,
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
