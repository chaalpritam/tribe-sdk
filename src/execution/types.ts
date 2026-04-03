/**
 * ExecutionProvider — the key abstraction for swapping between
 * direct Solana calls (prototype) and an Ephemeral Rollup (future).
 *
 * Client code never knows which provider is active.
 */
export interface SocialProfile {
  tid: bigint;
  followingCount: number;
  followersCount: number;
}

export interface Link {
  followerTid: bigint;
  followingTid: bigint;
  createdAt: number;
}

export interface ExecutionProvider {
  /** Follow a user. Returns transaction signature. */
  follow(followerTid: bigint, followingTid: bigint): Promise<string>;

  /** Unfollow a user. Returns transaction signature. */
  unfollow(followerTid: bigint, followingTid: bigint): Promise<string>;

  /** Check if a follow relationship exists. */
  getLink(followerTid: bigint, followingTid: bigint): Promise<Link | null>;

  /** Get a user's social profile (follower/following counts). */
  getProfile(tid: bigint): Promise<SocialProfile | null>;
}
