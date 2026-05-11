import { NetworkConfig } from "../network/types";
import { signMessage } from "../messages/signer";
import {
  MessageData,
  MessageType,
  Network,
  TribeMessage,
  UserDataBody,
} from "../messages/types";

export type UserDataField =
  | "bio"
  | "displayName"
  | "pfpUrl"
  | "coverUrl"
  | "url"
  | "location"
  | "city";

export interface UserProfileFields {
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
  /** URL of the profile cover / banner image. */
  coverUrl?: string;
  url?: string;
  location?: string;
  city?: string;
}

export interface HubUserResponse {
  tid: string;
  custody_address: string;
  recovery_address?: string;
  username?: string | null;
  registered_at?: string;
  following_count?: number;
  followers_count?: number;
  profile?: UserProfileFields;
}

export interface KarmaSummary {
  tid: string;
  total: number;
  level: number;
  breakdown: {
    tweets: number;
    reactions_received: number;
    followers: number;
    tips_received: number;
    tasks_completed: number;
  };
  weights: Record<string, number>;
}

/**
 * Publish profile fields (bio / displayName / pfpUrl / url / location)
 * as USER_DATA_ADD envelopes. The latest value per field wins on the
 * hub.
 */
export class UserDataClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  /** Publish a single field. */
  async setField(
    tid: bigint,
    field: UserDataField,
    value: string,
    signingKey: Uint8Array
  ): Promise<string> {
    const body: UserDataBody = { field, value };
    const data: MessageData = {
      type: MessageType.USER_DATA_ADD,
      tid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.network(),
      body,
    };
    const message = signMessage(data, signingKey);
    return this.submit(message);
  }

  /** Publish several fields at once (one envelope per field). */
  async setFields(
    tid: bigint,
    fields: UserProfileFields,
    signingKey: Uint8Array
  ): Promise<string[]> {
    const hashes: string[] = [];
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;
      hashes.push(
        await this.setField(tid, field as UserDataField, value, signingKey)
      );
    }
    return hashes;
  }

  /** Fetch a user's full profile, including the latest user_data fields. */
  async getUser(tid: bigint): Promise<HubUserResponse | null> {
    const res = await fetch(`${this.hubUrl}/v1/user/${tid}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as HubUserResponse;
  }

  /** Karma rollup for a TID. */
  async getKarma(tid: bigint): Promise<KarmaSummary> {
    const res = await fetch(`${this.hubUrl}/v1/users/${tid}/karma`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as KarmaSummary;
  }

  private network(): Network {
    return this.config.cluster === "mainnet-beta"
      ? Network.MAINNET
      : Network.DEVNET;
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
