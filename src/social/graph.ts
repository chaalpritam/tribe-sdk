import { ExecutionProvider, SocialProfile, Link } from "../execution/types";

/**
 * Social graph operations — delegates to the active ExecutionProvider.
 */
export class GraphClient {
  constructor(private execution: ExecutionProvider) {}

  async follow(followerFid: bigint, followingFid: bigint): Promise<string> {
    return this.execution.follow(followerFid, followingFid);
  }

  async unfollow(followerFid: bigint, followingFid: bigint): Promise<string> {
    return this.execution.unfollow(followerFid, followingFid);
  }

  async isFollowing(followerFid: bigint, followingFid: bigint): Promise<boolean> {
    const link = await this.execution.getLink(followerFid, followingFid);
    return link !== null;
  }

  async getProfile(fid: bigint): Promise<SocialProfile | null> {
    return this.execution.getProfile(fid);
  }
}
