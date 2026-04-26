import { NetworkConfig } from "../network/types";

export interface UserSearchResult {
  tid: string;
  custody_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  pfp_url: string | null;
}

export interface ChannelSearchResult {
  id: string;
  name: string | null;
  description: string | null;
  member_count: number;
  last_tweet_at: string | null;
}

export interface TweetSearchHit {
  hash: string;
  tid: string;
  type: number;
  text: string | null;
  parent_hash: string | null;
  channel_id: string | null;
  mentions: string[];
  embeds: string[];
  timestamp: string;
  username: string | null;
}

/**
 * Read-only search across tweets, users, and channels on the hub.
 */
export class SearchClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async tweets(q: string, limit = 20): Promise<TweetSearchHit[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const res = await fetch(`${this.hubUrl}/v1/search?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { tweets: TweetSearchHit[] };
    return json.tweets;
  }

  async users(q: string, limit = 20): Promise<UserSearchResult[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const res = await fetch(`${this.hubUrl}/v1/search/users?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { users: UserSearchResult[] };
    return json.users;
  }

  async channels(q: string, limit = 20): Promise<ChannelSearchResult[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const res = await fetch(`${this.hubUrl}/v1/search/channels?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { channels: ChannelSearchResult[] };
    return json.channels;
  }
}
