import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  ChannelKind,
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface ChannelInfo {
  id: string;
  name: string | null;
  description: string | null;
  kind: ChannelKind | null;
  latitude: number | null;
  longitude: number | null;
  created_by: string | null;
  created_at: string | null;
  member_count: number;
  tweet_count: number;
  last_tweet_at: string | null;
}

export interface CreateChannelOptions {
  description?: string;
  /** Defaults to INTEREST when omitted. CITY enables location fields. */
  kind?: ChannelKind;
  latitude?: number;
  longitude?: number;
}

export interface ChannelMember {
  tid: string;
  joined_at: string;
  username?: string | null;
  custody_address?: string | null;
}

/** Channel ops — create, join, leave, and read the directory. */
export class ChannelClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async create(
    creatorTid: bigint,
    channelId: string,
    name: string,
    options: CreateChannelOptions | undefined,
    signingKey: Uint8Array
  ): Promise<string> {
    const kind = options?.kind ?? ChannelKind.INTEREST;
    if (kind === ChannelKind.GENERAL) {
      // The "general" channel is hub-seeded and not user-creatable.
      throw new Error("ChannelKind.GENERAL is reserved for the hub-seeded default channel");
    }
    return this.publish(
      MessageType.CHANNEL_ADD,
      creatorTid,
      {
        channel_id: channelId,
        name,
        description: options?.description ?? null,
        kind,
        latitude: options?.latitude ?? null,
        longitude: options?.longitude ?? null,
      },
      signingKey
    );
  }

  async join(
    tid: bigint,
    channelId: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(
      MessageType.CHANNEL_JOIN,
      tid,
      { channel_id: channelId },
      signingKey
    );
  }

  async leave(
    tid: bigint,
    channelId: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(
      MessageType.CHANNEL_LEAVE,
      tid,
      { channel_id: channelId },
      signingKey
    );
  }

  async list(limit = 50, offset = 0): Promise<ChannelInfo[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const res = await fetch(`${this.hubUrl}/v1/channels?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { channels: ChannelInfo[] };
    return json.channels;
  }

  async get(id: string): Promise<ChannelInfo | null> {
    const res = await fetch(`${this.hubUrl}/v1/channels/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as ChannelInfo;
  }

  async members(id: string): Promise<ChannelMember[]> {
    const res = await fetch(
      `${this.hubUrl}/v1/channels/${encodeURIComponent(id)}/members`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { members: ChannelMember[] };
    return json.members;
  }

  async memberOf(tid: bigint): Promise<ChannelInfo[]> {
    const res = await fetch(`${this.hubUrl}/v1/channels/member/${tid}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { channels: ChannelInfo[] };
    return json.channels;
  }

  private network(): Network {
    return this.config.cluster === "mainnet-beta"
      ? Network.MAINNET
      : Network.DEVNET;
  }

  private async publish(
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
      // Channel bodies aren't in the protobuf schema yet — send the
      // raw object; submit() handles bigint-to-string serialization.
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
