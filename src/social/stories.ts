import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
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
  username?: string | null;
  pfp_url?: string | null;
}

export interface StoryViewer {
  viewer_tid: string;
  viewed_at: string;
  username?: string | null;
  pfp_url?: string | null;
}

/**
 * Stories — 24h ephemeral posts. The hub stamps `expires_at` at
 * insert (`created_at + 24h`) so clients can't dictate TTL, and the
 * hourly stories-cleanup cron purges expired rows (cascading
 * story_views with them).
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
    const wireBody: Record<string, unknown> = { media_hash: mediaHash };
    if (opts.caption) wireBody.caption = opts.caption;
    if (opts.music) wireBody.music = opts.music;
    return this.publishEnvelope(MessageType.STORY_ADD, tid, wireBody, signingKey);
  }

  /**
   * Mark a story as viewed by `tid`. The hub upserts a row in
   * story_views; idempotent — subsequent calls with the same
   * (story_hash, tid) keep the original viewed_at timestamp.
   */
  async view(
    tid: bigint,
    storyHash: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publishEnvelope(
      MessageType.STORY_VIEW,
      tid,
      { story_hash: storyHash },
      signingKey
    );
  }

  /**
   * All active stories across the network, grouped by author and
   * newest-first within each. Returns at most `limit` rows total
   * (default 100, max 200).
   */
  async list(opts: { limit?: number } = {}): Promise<Story[]> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    const res = await fetch(`${this.hubUrl}/v1/stories?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { stories: Story[] };
    return json.stories;
  }

  /** One author's currently-active stories, oldest-first. */
  async listByAuthor(tid: bigint): Promise<Story[]> {
    const res = await fetch(`${this.hubUrl}/v1/stories/${tid}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { stories: Story[] };
    return json.stories;
  }

  /**
   * Seen-by list for a story. Pass `viewerTid` to self-gate: a
   * non-author request gets a 403 from the hub (clients should hide
   * the entry point in that case).
   */
  async viewers(
    storyHash: string,
    opts: { viewerTid?: bigint } = {}
  ): Promise<StoryViewer[]> {
    const params = new URLSearchParams();
    if (opts.viewerTid !== undefined) {
      params.set("viewer_tid", opts.viewerTid.toString());
    }
    const res = await fetch(
      `${this.hubUrl}/v1/stories/${encodeURIComponent(storyHash)}/viewers?${params}`
    );
    if (res.status === 403) {
      throw new Error("Only the story's author can see the viewer list");
    }
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { viewers: StoryViewer[] };
    return json.viewers;
  }

  // MARK: - Internals

  private network(): Network {
    return this.config.cluster === "mainnet-beta"
      ? Network.MAINNET
      : Network.DEVNET;
  }

  private async publishEnvelope(
    type: MessageType,
    tid: bigint,
    body: Record<string, unknown>,
    signingKey: Uint8Array
  ): Promise<string> {
    const data: MessageData = {
      type,
      tid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.network(),
      body: body as unknown as MessageData["body"],
    };
    const message = signMessage(data, signingKey);
    return this.submit(message);
  }

  private async submit(message: TribeMessage): Promise<string> {
    const res = await fetch(`${this.hubUrl}/v1/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          protocolVersion: message.protocolVersion,
          data: message.data,
          dataB64: Buffer.from(message.dataBytes).toString("base64"),
          hash: Buffer.from(message.hash).toString("base64"),
          signature: Buffer.from(message.signature).toString("base64"),
          signer: Buffer.from(message.signer).toString("base64"),
        },
        (_, v) => (typeof v === "bigint" ? v.toString() : v)
      ),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Submit failed: ${res.status} ${txt}`);
    }
    const out = (await res.json()) as { hash: string };
    return out.hash;
  }
}
