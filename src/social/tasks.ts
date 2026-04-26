import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export type TaskStatus = "open" | "claimed" | "completed";

export interface TribeTask {
  id: string;
  creator_tid: string;
  title: string;
  description: string | null;
  reward_text: string | null;
  channel_id: string | null;
  status: TaskStatus;
  claimed_by_tid: string | null;
  completed_by_tid: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export class TaskClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async create(
    creatorTid: bigint,
    taskId: string,
    title: string,
    signingKey: Uint8Array,
    opts: {
      description?: string;
      rewardText?: string;
      channelId?: string;
    } = {}
  ): Promise<string> {
    const body: Record<string, unknown> = { task_id: taskId, title };
    if (opts.description) body.description = opts.description;
    if (opts.rewardText) body.reward_text = opts.rewardText;
    if (opts.channelId) body.channel_id = opts.channelId;
    return this.publish(MessageType.TASK_ADD, creatorTid, body, signingKey);
  }

  async claim(
    tid: bigint,
    taskId: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(
      MessageType.TASK_CLAIM,
      tid,
      { task_id: taskId },
      signingKey
    );
  }

  async complete(
    tid: bigint,
    taskId: string,
    signingKey: Uint8Array
  ): Promise<string> {
    return this.publish(
      MessageType.TASK_COMPLETE,
      tid,
      { task_id: taskId },
      signingKey
    );
  }

  async list(
    opts: {
      limit?: number;
      offset?: number;
      channelId?: string;
      status?: TaskStatus;
    } = {}
  ): Promise<TribeTask[]> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    if (opts.channelId) params.set("channel_id", opts.channelId);
    if (opts.status) params.set("status", opts.status);
    const res = await fetch(`${this.hubUrl}/v1/tasks?${params}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { tasks: TribeTask[] };
    return json.tasks;
  }

  async get(id: string): Promise<TribeTask | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/tasks/${encodeURIComponent(id)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as TribeTask;
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
