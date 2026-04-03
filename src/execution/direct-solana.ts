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

  async follow(followerTid: bigint, followingTid: bigint): Promise<string> {
    const followerTidRecord = this.deriveTidRecord(followerTid);

    const [followerProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followerTid)],
      this.config.programIds.socialGraph
    );

    const [followingProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    const [link] = PublicKey.findProgramAddressSync(
      [Buffer.from("link"), this.tidToBuffer(followerTid), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .follow()
      .accounts({
        followerTidRecord,
        followerProfile,
        followingProfile,
        link,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async unfollow(followerTid: bigint, followingTid: bigint): Promise<string> {
    const followerTidRecord = this.deriveTidRecord(followerTid);

    const [followerProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followerTid)],
      this.config.programIds.socialGraph
    );

    const [followingProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    const [link] = PublicKey.findProgramAddressSync(
      [Buffer.from("link"), this.tidToBuffer(followerTid), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .unfollow()
      .accounts({
        followerTidRecord,
        followerProfile,
        followingProfile,
        link,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  async getLink(followerTid: bigint, followingTid: bigint): Promise<Link | null> {
    const [linkPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("link"), this.tidToBuffer(followerTid), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    try {
      const account = await (this.program.account as any).link.fetch(linkPda);
      const data = account as any;
      return {
        followerTid: BigInt(data.followerTid.toString()),
        followingTid: BigInt(data.followingTid.toString()),
        createdAt: (data.createdAt as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }

  async getProfile(tid: bigint): Promise<SocialProfile | null> {
    const [profilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(tid)],
      this.config.programIds.socialGraph
    );

    try {
      const account = await (this.program.account as any).socialProfile.fetch(profilePda);
      const data = account as any;
      return {
        tid: BigInt(data.tid.toString()),
        followingCount: data.followingCount,
        followersCount: data.followersCount,
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
