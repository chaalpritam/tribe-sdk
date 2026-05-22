import { NetworkConfig } from "../network/types";
import { signJsonMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface Story {
  hash: string;
  author_tid: string;
  media_hash: string;
  caption: string | null;
  music: string | null;
  created_at: string;
  expires_at: string;
}

export interface StoryViewer {
  viewer_tid: string;
  viewed_at: string;
}

export interface StoryAuthorGroup {
  author_tid: string;
  stories: Story[];
}

/**
 * 24h ephemeral stories (STORY_ADD / STORY_VIEW).
 * Uses JSON envelope signing until protobuf story bodies ship.
 */
export class StoryClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async publish(
    tid: bigint,
    mediaHash: string,
    signingKey: Uint8Array,
    opts: { caption?: string; music?: string } = {}
  ): Promise<string> {
    const body: Record<string, string> = { media_hash: mediaHash };
    if (opts.caption) body.caption = opts.caption;
    if (opts.music) body.music = opts.music;
    return this.publishEnvelope(MessageType.STORY_ADD, tid, body, signingKey);
  }

  async markViewed(
    viewerTid: bigint,
    storyHash: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publishEnvelope(
      MessageType.STORY_VIEW,
      viewerTid,
      { story_hash: storyHash },
      signingKey
    );
  }

  async listFeed(): Promise<StoryAuthorGroup[]> {
    const res = await fetch(`${this.hubUrl}/v1/stories`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { authors: StoryAuthorGroup[] };
    return json.authors;
  }

  async listByAuthor(tid: bigint): Promise<Story[]> {
    const res = await fetch(`${this.hubUrl}/v1/stories/${tid}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { stories: Story[] };
    return json.stories;
  }

  async listViewers(
    storyHash: string,
    viewerTid: bigint
  ): Promise<StoryViewer[]> {
    const params = new URLSearchParams({ viewer_tid: String(viewerTid) });
    const res = await fetch(
      `${this.hubUrl}/v1/stories/${encodeURIComponent(storyHash)}/viewers?${params}`
    );
    if (res.status === 403) {
      throw new Error("Only the story author can list viewers");
    }
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { viewers: StoryViewer[] };
    return json.viewers;
  }

  private network(): Network {
    return this.config.cluster === "mainnet-beta"
      ? Network.MAINNET
      : Network.DEVNET;
  }

  private async publishEnvelope(
    type: MessageType,
    tid: bigint,
    body: Record<string, string>,
    signingKey: Uint8Array
  ): Promise<string> {
    const data: MessageData = {
      type,
      tid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.network(),
      body: body as unknown as MessageData["body"],
    };
    const message = signJsonMessage(data, signingKey);
    return this.submit(message);
  }

  private async submit(message: TribeMessage): Promise<string> {
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
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Submit failed: ${res.status} ${err}`);
    }
    const json = (await res.json()) as { hash: string };
    return json.hash;
  }
}
