import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface Crowdfund {
  id: string;
  creator_tid: string;
  title: string;
  description: string | null;
  goal_amount: string;
  currency: string;
  deadline_at: string | null;
  image_url: string | null;
  channel_id: string | null;
  created_at: string;
  raised_amount: string;
  pledger_count: number;
}

export interface Pledge {
  hash: string;
  pledger_tid: string;
  amount: string;
  currency: string;
  pledged_at: string;
}

export class CrowdfundClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async create(
    creatorTid: bigint,
    crowdfundId: string,
    title: string,
    goalAmount: number,
    signingKey: Uint8Array,
    opts: {
      description?: string;
      currency?: string;
      deadlineAtUnix?: number;
      imageUrl?: string;
      channelId?: string;
    } = {}
  ): Promise<string> {
    const body: Record<string, unknown> = {
      crowdfund_id: crowdfundId,
      title,
      goal_amount: goalAmount,
    };
    if (opts.description) body.description = opts.description;
    if (opts.currency) body.currency = opts.currency;
    if (opts.deadlineAtUnix) body.deadline_at = opts.deadlineAtUnix;
    if (opts.imageUrl) body.image_url = opts.imageUrl;
    if (opts.channelId) body.channel_id = opts.channelId;
    return this.publish(
      MessageType.CROWDFUND_ADD,
      creatorTid,
      body,
      signingKey
    );
  }

  async pledge(
    pledgerTid: bigint,
    crowdfundId: string,
    amount: number,
    signingKey: Uint8Array,
    currency = "USD"
  ): Promise<string> {
    return this.publish(
      MessageType.CROWDFUND_PLEDGE,
      pledgerTid,
      { crowdfund_id: crowdfundId, amount, currency },
      signingKey
    );
  }

  async list(
    opts: { limit?: number; offset?: number; channelId?: string } = {}
  ): Promise<Crowdfund[]> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    if (opts.channelId) params.set("channel_id", opts.channelId);
    const res = await fetch(`${this.hubUrl}/v1/crowdfunds?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { crowdfunds: Crowdfund[] };
    return json.crowdfunds;
  }

  async get(id: string): Promise<Crowdfund | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/crowdfunds/${encodeURIComponent(id)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as Crowdfund;
  }

  async pledges(id: string, limit = 100): Promise<Pledge[]> {
    const res = await fetch(
      `${this.hubUrl}/v1/crowdfunds/${encodeURIComponent(id)}/pledges?limit=${limit}`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { pledges: Pledge[] };
    return json.pledges;
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
