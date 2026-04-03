import { ExecutionProvider, SocialProfile, Link } from "../execution/types";

/**
 * Social graph operations — delegates to the active ExecutionProvider.
 */
export class GraphClient {
  constructor(private execution: ExecutionProvider) {}

  async follow(followerTid: bigint, followingTid: bigint): Promise<string> {
    return this.execution.follow(followerTid, followingTid);
  }

  async unfollow(followerTid: bigint, followingTid: bigint): Promise<string> {
    return this.execution.unfollow(followerTid, followingTid);
  }

  async isFollowing(followerTid: bigint, followingTid: bigint): Promise<boolean> {
    const link = await this.execution.getLink(followerTid, followingTid);
    return link !== null;
  }

  async getProfile(tid: bigint): Promise<SocialProfile | null> {
    return this.execution.getProfile(tid);
  }
}
