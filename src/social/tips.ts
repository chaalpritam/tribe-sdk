import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface Tip {
  hash: string;
  sender_tid: string;
  recipient_tid: string;
  target_hash: string | null;
  amount: string;
  currency: string;
  tx_signature: string | null;
  sent_at: string;
}

export interface TipsForTarget {
  tips: Tip[];
  tip_count: number;
  total_amount: string;
}

/** Tip envelopes — log a social signal that someone sent value. */
export class TipClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  async send(
    senderTid: bigint,
    recipientTid: bigint,
    amount: number,
    signingKey: Uint8Array,
    opts: {
      currency?: string;
      targetHash?: string;
      txSignature?: string;
    } = {}
  ): Promise<string> {
    const body: Record<string, unknown> = {
      recipient_tid: recipientTid.toString(),
      amount,
      currency: opts.currency ?? "USD",
    };
    if (opts.targetHash) body.target_hash = opts.targetHash;
    if (opts.txSignature) body.tx_signature = opts.txSignature;
    return this.publish(MessageType.TIP_ADD, senderTid, body, signingKey);
  }

  async sent(tid: bigint, limit = 100): Promise<Tip[]> {
    const res = await fetch(
      `${this.hubUrl}/v1/tips/sent/${tid}?limit=${limit}`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { tips: Tip[] };
    return json.tips;
  }

  async received(tid: bigint, limit = 100): Promise<Tip[]> {
    const res = await fetch(
      `${this.hubUrl}/v1/tips/received/${tid}?limit=${limit}`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { tips: Tip[] };
    return json.tips;
  }

  async forTarget(targetHash: string, limit = 100): Promise<TipsForTarget> {
    const res = await fetch(
      `${this.hubUrl}/v1/tips/target/${encodeURIComponent(targetHash)}?limit=${limit}`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as TipsForTarget;
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
