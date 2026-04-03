import { ExecutionProvider, SocialProfile, Link } from "./types";

/**
 * EphemeralRollupProvider — routes social graph operations through the ER server.
 *
 * Operations are optimistically confirmed, then batched and settled to Solana L1
 * by the ER server. Reads come from the ER server's local state with on-chain fallback.
 */
export class EphemeralRollupProvider implements ExecutionProvider {
  private erServerUrl: string;
  private custodyPubkey: string;
  private signFn: (message: Uint8Array) => Promise<Uint8Array>;

  constructor(opts: {
    erServerUrl: string;
    custodyPubkey: string;
    signFn: (message: Uint8Array) => Promise<Uint8Array>;
  }) {
    this.erServerUrl = opts.erServerUrl;
    this.custodyPubkey = opts.custodyPubkey;
    this.signFn = opts.signFn;
  }

  async follow(followerTid: bigint, followingTid: bigint): Promise<string> {
    return this.submitOperation("follow", followerTid, followingTid);
  }

  async unfollow(followerTid: bigint, followingTid: bigint): Promise<string> {
    return this.submitOperation("unfollow", followerTid, followingTid);
  }

  async getLink(followerTid: bigint, followingTid: bigint): Promise<Link | null> {
    const res = await fetch(
      `${this.erServerUrl}/v1/link/${followerTid}/${followingTid}`
    );
    if (!res.ok) return null;
    const data = await res.json() as { exists: boolean; createdAt?: number };
    if (!data.exists) return null;
    return {
      followerTid,
      followingTid,
      createdAt: data.createdAt ?? 0,
    };
  }

  async getProfile(tid: bigint): Promise<SocialProfile | null> {
    const res = await fetch(`${this.erServerUrl}/v1/profile/${tid}`);
    if (!res.ok) return null;
    const data = await res.json() as { tid?: string; followingCount?: number; followersCount?: number };
    if (!data.tid) return null;
    return {
      tid: BigInt(data.tid),
      followingCount: data.followingCount ?? 0,
      followersCount: data.followersCount ?? 0,
    };
  }

  private async submitOperation(
    opType: "follow" | "unfollow",
    followerTid: bigint,
    followingTid: bigint
  ): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = `tribe-er:${opType}:${followerTid}:${followingTid}:${timestamp}`;
    const payloadBytes = new TextEncoder().encode(payload);
    const signature = await this.signFn(payloadBytes);

    const res = await fetch(`${this.erServerUrl}/v1/${opType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        followerTid: followerTid.toString(),
        followingTid: followingTid.toString(),
        custodyPubkey: this.custodyPubkey,
        signature: this.toBase64(signature),
        timestamp,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ER ${opType} failed: ${res.status} ${err}`);
    }

    const data = await res.json() as { id: string };
    return data.id;
  }

  private toBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString("base64");
  }
}
