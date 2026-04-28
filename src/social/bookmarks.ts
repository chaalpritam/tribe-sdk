import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface Bookmark {
  target_hash: string;
  bookmarked_at: string;
  author_tid?: string | null;
  text?: string | null;
  timestamp?: string | null;
  parent_hash?: string | null;
  channel_id?: string | null;
  embeds?: string[] | null;
}

/** Per-TID bookmark list. Add / remove via signed envelopes. */
export class BookmarkClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async add(
    tid: bigint,
    targetHash: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(MessageType.BOOKMARK_ADD, tid, targetHash, signingKey);
  }

  async remove(
    tid: bigint,
    targetHash: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(MessageType.BOOKMARK_REMOVE, tid, targetHash, signingKey);
  }

  async list(tid: bigint, limit = 50, offset = 0): Promise<Bookmark[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const res = await fetch(`${this.hubUrl}/v1/bookmarks/${tid}?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { bookmarks: Bookmark[] };
    return json.bookmarks;
  }

  private network(): Network {
    return this.config.cluster === "mainnet-beta"
      ? Network.MAINNET
      : Network.DEVNET;
  }

  private async publish(
    type: MessageType,
    tid: bigint,
    targetHash: string,
    signingKey: Uint8Array
  ): Promise<string> {
    const data: MessageData = {
      type,
      tid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.network(),
      body: { target_hash: targetHash } as unknown as MessageData["body"],
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
