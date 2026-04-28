import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface Poll {
  id: string;
  creator_tid: string;
  question: string;
  options: string[];
  expires_at: string | null;
  channel_id: string | null;
  created_at: string;
}

export interface PollWithTally extends Poll {
  /** Vote counts keyed by option index. Missing keys = 0 votes. */
  tally: Record<number, number>;
}

export interface PollVote {
  option_index: number;
  voted_at: string;
}

/** Polls — create + vote + read tallies. */
export class PollClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async create(
    creatorTid: bigint,
    pollId: string,
    question: string,
    options: string[],
    signingKey: Uint8Array,
    opts: { expiresAtUnix?: number; channelId?: string } = {}
  ): Promise<string> {
    const wireBody: Record<string, unknown> = {
      poll_id: pollId,
      question,
      options,
    };
    if (opts.expiresAtUnix) wireBody.expires_at = opts.expiresAtUnix;
    if (opts.channelId) wireBody.channel_id = opts.channelId;
    return this.publish(MessageType.POLL_ADD, creatorTid, wireBody, signingKey);
  }

  async vote(
    voterTid: bigint,
    pollId: string,
    optionIndex: number,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(
      MessageType.POLL_VOTE,
      voterTid,
      { poll_id: pollId, option_index: optionIndex },
      signingKey
    );
  }

  async list(
    opts: { limit?: number; offset?: number; channelId?: string } = {}
  ): Promise<Poll[]> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    if (opts.channelId) params.set("channel_id", opts.channelId);
    const res = await fetch(`${this.hubUrl}/v1/polls?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { polls: Poll[] };
    return json.polls;
  }

  async get(id: string): Promise<PollWithTally | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/polls/${encodeURIComponent(id)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as PollWithTally;
  }

  async getMyVote(id: string, tid: bigint): Promise<PollVote | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/polls/${encodeURIComponent(id)}/vote/${tid}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as PollVote;
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
