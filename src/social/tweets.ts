import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageType,
  MessageData,
  TweetAddBody,
  Network,
  TribeMessage,
  GENERAL_CHANNEL_ID,
} from "../messages/types";

export interface Tweet {
  hash: string;
  tid: bigint;
  text: string;
  mentions: bigint[];
  embeds: string[];
  parentHash?: string;
  channelId?: string;
  timestamp: number;
}

export interface TweetPage {
  tweets: Tweet[];
  cursor?: string;
}

/**
 * Tweet operations — talks to the hub via HTTP.
 */
export class TweetClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  /**
   * Publish a new tweet. Signs with the app key and submits to the hub.
   */
  async publish(
    tid: bigint,
    text: string,
    signingKey: Uint8Array,
    options?: {
      mentions?: bigint[];
      embeds?: string[];
      parentHash?: Uint8Array;
      channelId?: string;
    }
  ): Promise<string> {
    // Every tweet must belong to a channel. Fall back to the reserved
    // "general" channel if the caller didn't pick one — this is the
    // protocol's "post to everyone" default.
    const channelId = options?.channelId?.trim() || GENERAL_CHANNEL_ID;

    const body: TweetAddBody = {
      text,
      mentions: options?.mentions ?? [],
      embeds: options?.embeds ?? [],
      parentHash: options?.parentHash,
      channelId,
    };

    const data: MessageData = {
      type: MessageType.TWEET_ADD,
      tid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.config.cluster === "mainnet-beta" ? Network.MAINNET : Network.DEVNET,
      body,
    };

    const message = signMessage(data, signingKey);
    return this.submitMessage(message);
  }

  /**
   * Get tweets by TID (paginated).
   */
  async getTweetsByTid(tid: bigint, limit = 20, cursor?: string): Promise<TweetPage> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${this.hubUrl}/v1/feed/${tid}?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as TweetPage;
  }

  /**
   * Get a single tweet by hash.
   */
  async getTweet(hash: string): Promise<Tweet | null> {
    const res = await fetch(`${this.hubUrl}/v1/messages/${encodeURIComponent(hash)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as Tweet;
  }

  private async submitMessage(message: TribeMessage): Promise<string> {
    const res = await fetch(`${this.hubUrl}/v1/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        protocolVersion: message.protocolVersion,
        data: message.data,
        dataB64: Buffer.from(message.dataBytes).toString("base64"),
        hash: Buffer.from(message.hash).toString("base64"),
        signature: Buffer.from(message.signature).toString("base64"),
        signer: Buffer.from(message.signer).toString("base64"),
      }, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Submit failed: ${res.status} ${body}`);
    }
    const result = (await res.json()) as { hash: string };
    return result.hash;
  }
}
