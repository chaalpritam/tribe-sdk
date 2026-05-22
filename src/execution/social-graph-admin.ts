import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import socialGraphIdl from "../idl/social_graph.json";

/**
 * Admin / sequencer operations for the social-graph program.
 * Used by ER operators and deploy scripts — not needed for typical app users.
 */
export class SocialGraphAdminClient {
  private program: Program;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(socialGraphIdl as any, provider);
  }

  async initSequencer(authority: PublicKey): Promise<TransactionSignature> {
    const [sequencerConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("sequencer_config")],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .initSequencer(authority)
      .accounts({
        sequencerConfig,
        admin: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async updateSequencer(newAuthority: PublicKey): Promise<TransactionSignature> {
    const [sequencerConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("sequencer_config")],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .updateSequencer(newAuthority)
      .accounts({
        sequencerConfig,
        admin: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  async initProfileDelegated(tid: bigint): Promise<TransactionSignature> {
    const [sequencerConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("sequencer_config")],
      this.config.programIds.socialGraph
    );

    const [socialProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(tid)],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .initProfileDelegated(new BN(tid.toString()))
      .accounts({
        sequencerConfig,
        socialProfile,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async followDelegated(
    followerTid: bigint,
    followingTid: bigint
  ): Promise<TransactionSignature> {
    const [sequencerConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("sequencer_config")],
      this.config.programIds.socialGraph
    );

    const [followerProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followerTid)],
      this.config.programIds.socialGraph
    );

    const [followingProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    const [link] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("link"),
        this.tidToBuffer(followerTid),
        this.tidToBuffer(followingTid),
      ],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .followDelegated(
        new BN(followerTid.toString()),
        new BN(followingTid.toString())
      )
      .accounts({
        sequencerConfig,
        followerProfile,
        followingProfile,
        link,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async unfollowDelegated(
    followerTid: bigint,
    followingTid: bigint
  ): Promise<TransactionSignature> {
    const [sequencerConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("sequencer_config")],
      this.config.programIds.socialGraph
    );

    const [followerProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followerTid)],
      this.config.programIds.socialGraph
    );

    const [followingProfile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), this.tidToBuffer(followingTid)],
      this.config.programIds.socialGraph
    );

    const [link] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("link"),
        this.tidToBuffer(followerTid),
        this.tidToBuffer(followingTid),
      ],
      this.config.programIds.socialGraph
    );

    return this.program.methods
      .unfollowDelegated(
        new BN(followerTid.toString()),
        new BN(followingTid.toString())
      )
      .accounts({
        sequencerConfig,
        followerProfile,
        followingProfile,
        link,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  private tidToBuffer(tid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(tid);
    return buf;
  }
}
