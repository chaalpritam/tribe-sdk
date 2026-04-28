import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface TribeEvent {
  id: string;
  creator_tid: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  channel_id: string | null;
  image_url: string | null;
  created_at: string;
}

export interface TribeEventWithRsvps extends TribeEvent {
  rsvp_counts: { yes: number; no: number; maybe: number };
}

export interface RsvpRecord {
  status: "yes" | "no" | "maybe";
  rsvped_at: string;
}

export class EventClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async create(
    creatorTid: bigint,
    eventId: string,
    title: string,
    startsAtUnix: number,
    signingKey: Uint8Array,
    opts: {
      description?: string;
      endsAtUnix?: number;
      locationText?: string;
      latitude?: number;
      longitude?: number;
      channelId?: string;
      imageUrl?: string;
    } = {}
  ): Promise<string> {
    const body: Record<string, unknown> = {
      event_id: eventId,
      title,
      starts_at: startsAtUnix,
    };
    if (opts.description) body.description = opts.description;
    if (opts.endsAtUnix) body.ends_at = opts.endsAtUnix;
    if (opts.locationText) body.location_text = opts.locationText;
    if (opts.latitude !== undefined) body.latitude = opts.latitude;
    if (opts.longitude !== undefined) body.longitude = opts.longitude;
    if (opts.channelId) body.channel_id = opts.channelId;
    if (opts.imageUrl) body.image_url = opts.imageUrl;
    return this.publish(MessageType.EVENT_ADD, creatorTid, body, signingKey);
  }

  async rsvp(
    tid: bigint,
    eventId: string,
    status: "yes" | "no" | "maybe",
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(
      MessageType.EVENT_RSVP,
      tid,
      { event_id: eventId, status },
      signingKey
    );
  }

  async list(
    opts: {
      limit?: number;
      offset?: number;
      channelId?: string;
      upcoming?: boolean;
    } = {}
  ): Promise<TribeEvent[]> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    if (opts.channelId) params.set("channel_id", opts.channelId);
    if (opts.upcoming) params.set("upcoming", "true");
    const res = await fetch(`${this.hubUrl}/v1/events?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { events: TribeEvent[] };
    return json.events;
  }

  async get(id: string): Promise<TribeEventWithRsvps | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/events/${encodeURIComponent(id)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as TribeEventWithRsvps;
  }

  async getRsvp(id: string, tid: bigint): Promise<RsvpRecord | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/events/${encodeURIComponent(id)}/rsvp/${tid}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as RsvpRecord;
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
