import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageType,
  MessageData,
  CastAddBody,
  Network,
  TribeMessage,
} from "../messages/types";

export interface Cast {
  hash: string;
  fid: bigint;
  text: string;
  mentions: bigint[];
  embeds: string[];
  parentHash?: string;
  channelId?: string;
  timestamp: number;
}

export interface CastPage {
  casts: Cast[];
  cursor?: string;
}

/**
 * Cast operations — talks to the cast server via HTTP.
 */
export class CastClient {
  private castServerUrl: string;

  constructor(private config: NetworkConfig) {
    this.castServerUrl = config.castServerUrl;
  }

  /**
   * Publish a new cast. Signs with the app key and submits to cast server.
   */
  async publish(
    fid: bigint,
    text: string,
    signingKey: Uint8Array,
    options?: {
      mentions?: bigint[];
      embeds?: string[];
      parentHash?: Uint8Array;
      channelId?: string;
    }
  ): Promise<string> {
    const body: CastAddBody = {
      text,
      mentions: options?.mentions ?? [],
      embeds: options?.embeds ?? [],
      parentHash: options?.parentHash,
      channelId: options?.channelId,
    };

    const data: MessageData = {
      type: MessageType.CAST_ADD,
      fid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.config.cluster === "mainnet-beta" ? Network.MAINNET : Network.DEVNET,
      body,
    };

    const message = signMessage(data, signingKey);
    return this.submitMessage(message);
  }

  /**
   * Get casts by FID (paginated).
   */
  async getCastsByFid(fid: bigint, limit = 20, cursor?: string): Promise<CastPage> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${this.castServerUrl}/v1/castsByFid/${fid}?${params}`);
    if (!res.ok) throw new Error(`Cast server error: ${res.status}`);
    return res.json();
  }

  /**
   * Get a single cast by hash.
   */
  async getCast(hash: string): Promise<Cast | null> {
    const res = await fetch(`${this.castServerUrl}/v1/cast/${hash}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Cast server error: ${res.status}`);
    return res.json();
  }

  private async submitMessage(message: TribeMessage): Promise<string> {
    const res = await fetch(`${this.castServerUrl}/v1/submitMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        protocolVersion: message.protocolVersion,
        data: message.data,
        hash: Buffer.from(message.hash).toString("base64"),
        signature: Buffer.from(message.signature).toString("base64"),
        signer: Buffer.from(message.signer).toString("base64"),
      }, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    });
    if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
    const result = await res.json();
    return result.hash;
  }
}
