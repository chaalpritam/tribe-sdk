/**
 * ExecutionProvider — the key abstraction for swapping between
 * direct Solana calls (prototype) and an Ephemeral Rollup (future).
 *
 * Client code never knows which provider is active.
 */
export interface SocialProfile {
  fid: bigint;
  followingCount: number;
  followersCount: number;
}

export interface Link {
  followerFid: bigint;
  followingFid: bigint;
  createdAt: number;
}

export interface ExecutionProvider {
  /** Follow a user. Returns transaction signature. */
  follow(followerFid: bigint, followingFid: bigint): Promise<string>;

  /** Unfollow a user. Returns transaction signature. */
  unfollow(followerFid: bigint, followingFid: bigint): Promise<string>;

  /** Check if a follow relationship exists. */
  getLink(followerFid: bigint, followingFid: bigint): Promise<Link | null>;

  /** Get a user's social profile (follower/following counts). */
  getProfile(fid: bigint): Promise<SocialProfile | null>;
}
