import nacl from "tweetnacl";
import { NetworkConfig } from "../network/types";
import { signJsonMessage } from "../messages/signer";
import {
  DmKeyRegisterBody,
  DmSendBody,
  MessageData,
  MessageType,
  Network,
  TribeMessage,
} from "../messages/types";

export interface DmKeyRecord {
  tid: string;
  x25519_pubkey: string;
  registered_at: string;
}

export interface DmConversation {
  id: string;
  peer_tid: string;
  last_message_at: string;
}

export interface EncryptedDm {
  hash: string;
  sender_tid: string;
  recipient_tid: string;
  ciphertext: string;
  nonce: string;
  sender_x25519: string;
  timestamp: string;
}

export interface DecryptedDm extends Omit<EncryptedDm, "ciphertext"> {
  text: string;
}

export interface DmGroupSummary {
  id: string;
  name: string;
  creator_tid: string;
  created_at: string;
  joined_at: string;
  member_count: number;
}

export interface DmGroupMember {
  tid: string;
  joined_at: string;
}

export interface DmGroup {
  id: string;
  name: string;
  creator_tid: string;
  created_at: string;
  members: DmGroupMember[];
}

export interface EncryptedGroupDm {
  hash: string;
  sender_tid: string;
  sender_x25519: string;
  timestamp: string;
  ciphertext: string;
  nonce: string;
}

export interface DmReadReceipt {
  tid: string;
  last_read_hash: string;
  last_read_at: string;
}

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

/**
 * Generate a fresh x25519 keypair for DMs. The public key should be
 * registered via `DmClient.registerKey`; the secret key stays on the
 * caller's device.
 */
export function generateDmKeypair(): nacl.BoxKeyPair {
  return nacl.box.keyPair();
}

/**
 * Encrypt plaintext for a recipient using x25519 + xsalsa20-poly1305.
 */
export function encryptDm(
  plaintext: string,
  recipientX25519Pubkey: string,
  senderKeypair: nacl.BoxKeyPair
): { ciphertext: string; nonce: string; senderX25519: string } {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = new TextEncoder().encode(plaintext);
  const recipientKey = fromBase64(recipientX25519Pubkey);
  const ciphertext = nacl.box(
    messageBytes,
    nonce,
    recipientKey,
    senderKeypair.secretKey
  );
  if (!ciphertext) throw new Error("DM encryption failed");
  return {
    ciphertext: toBase64(ciphertext),
    nonce: toBase64(nonce),
    senderX25519: toBase64(senderKeypair.publicKey),
  };
}

export interface DmAttachment {
  /** URL where the (optionally encrypted) blob lives. */
  url: string;
  /** MIME type — png, mp4, etc. */
  contentType?: string;
  /** Optional opaque size hint. */
  size?: number;
  /**
   * If the blob at `url` is encrypted, base64 nacl.secretbox key + nonce
   * to decrypt it. Omit for public CDN-style attachments.
   */
  decryptionKey?: string;
  decryptionNonce?: string;
}

export interface RichDmPayload {
  text: string;
  attachments?: DmAttachment[];
}

/** Convert a rich payload to the plaintext blob fed into encryptDm. */
export function encodeRichDm(payload: RichDmPayload): string {
  // Versioned envelope so future fields can be added without breaking
  // older readers.
  return JSON.stringify({ v: 1, ...payload });
}

/** Reverse of encodeRichDm. Returns null if the plaintext isn't rich. */
export function decodeRichDm(plaintext: string): RichDmPayload | null {
  if (!plaintext) return null;
  if (plaintext[0] !== "{") return null;
  try {
    const parsed = JSON.parse(plaintext) as { v?: number } & RichDmPayload;
    if (parsed.v !== 1 || typeof parsed.text !== "string") return null;
    return { text: parsed.text, attachments: parsed.attachments };
  } catch {
    return null;
  }
}

/**
 * Decrypt an EncryptedDm using the recipient's keypair. Returns null if
 * the ciphertext can't be opened (wrong recipient, tampered, etc.).
 */
export function decryptDm(
  dm: EncryptedDm,
  recipientKeypair: nacl.BoxKeyPair
): string | null {
  const ciphertext = fromBase64(dm.ciphertext);
  const nonce = fromBase64(dm.nonce);
  const senderKey = fromBase64(dm.sender_x25519);
  const opened = nacl.box.open(
    ciphertext,
    nonce,
    senderKey,
    recipientKeypair.secretKey
  );
  if (!opened) return null;
  return new TextDecoder().decode(opened);
}

/**
 * DM operations — all routed through the hub. The hub stores ciphertext
 * only; encryption and decryption happen client-side.
 */
export class DmClient {
  private hubUrl: string;

  constructor(private config: NetworkConfig) {
    this.hubUrl = config.hubUrl;
  }

  /** Register or replace the x25519 public key for a TID. */
  async registerKey(
    tid: bigint,
    x25519Pubkey: string,
    appSigningKey: Uint8Array
  ): Promise<void> {
    const wireBody = { x25519_pubkey: x25519Pubkey };
    const message = this.sign(MessageType.DM_KEY_REGISTER, tid, wireBody, appSigningKey);
    await this.post("/v1/dm/register-key", message);
  }

  /** Look up a TID's x25519 pubkey so a sender can encrypt to them. */
  async getKey(tid: bigint): Promise<DmKeyRecord | null> {
    const res = await fetch(`${this.hubUrl}/v1/dm/key/${tid}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as DmKeyRecord;
  }

  /**
   * Send an already-encrypted DM. Use {@link encryptDm} to produce
   * `ciphertext`, `nonce`, and `senderX25519` from plaintext.
   */
  async send(
    senderTid: bigint,
    recipientTid: bigint,
    encrypted: { ciphertext: string; nonce: string; senderX25519: string },
    appSigningKey: Uint8Array
  ): Promise<{ hash: string; conversationId: string }> {
    const wireBody = {
      recipient_tid: recipientTid.toString(),
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
      sender_x25519: encrypted.senderX25519,
    };
    const message = this.sign(MessageType.DM_SEND, senderTid, wireBody, appSigningKey);
    const result = await this.post<{ hash: string; conversation_id: string }>(
      "/v1/dm/send",
      message
    );
    return { hash: result.hash, conversationId: result.conversation_id };
  }

  /** Convenience wrapper: fetch peer key, encrypt, and send. */
  async sendText(
    senderTid: bigint,
    recipientTid: bigint,
    plaintext: string,
    appSigningKey: Uint8Array,
    senderKeypair: nacl.BoxKeyPair
  ): Promise<{ hash: string; conversationId: string }> {
    const peer = await this.getKey(recipientTid);
    if (!peer) throw new Error(`Recipient TID ${recipientTid} has no DM key`);
    const encrypted = encryptDm(plaintext, peer.x25519_pubkey, senderKeypair);
    return this.send(senderTid, recipientTid, encrypted, appSigningKey);
  }

  /**
   * Send a rich DM (text + attachments). The whole RichDmPayload
   * is JSON-encoded and put through the same encryption path as
   * plain text — recipient calls decryptDm then decodeRichDm.
   */
  async sendRich(
    senderTid: bigint,
    recipientTid: bigint,
    payload: RichDmPayload,
    appSigningKey: Uint8Array,
    senderKeypair: nacl.BoxKeyPair
  ): Promise<{ hash: string; conversationId: string }> {
    return this.sendText(
      senderTid,
      recipientTid,
      encodeRichDm(payload),
      appSigningKey,
      senderKeypair
    );
  }

  /** List the conversations a TID is a participant in, newest first. */
  async listConversations(tid: bigint): Promise<DmConversation[]> {
    const res = await fetch(`${this.hubUrl}/v1/dm/conversations/${tid}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { conversations: DmConversation[] };
    return json.conversations;
  }

  /** Fetch encrypted messages in a conversation (oldest first). */
  async messages(
    conversationId: string,
    tid: bigint,
    options: { limit?: number; before?: Date } = {}
  ): Promise<EncryptedDm[]> {
    const params = new URLSearchParams({ tid: tid.toString() });
    if (options.limit) params.set("limit", String(options.limit));
    if (options.before) params.set("before", options.before.toISOString());
    const res = await fetch(
      `${this.hubUrl}/v1/dm/messages/${encodeURIComponent(conversationId)}?${params}`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { messages: EncryptedDm[] };
    return json.messages;
  }

  /** Convenience: like {@link messages} but also decrypts. */
  async decryptedMessages(
    conversationId: string,
    tid: bigint,
    recipientKeypair: nacl.BoxKeyPair,
    options: { limit?: number; before?: Date } = {}
  ): Promise<DecryptedDm[]> {
    const encrypted = await this.messages(conversationId, tid, options);
    return encrypted.map((dm) => {
      const text = decryptDm(dm, recipientKeypair);
      const { ciphertext: _drop, ...rest } = dm;
      void _drop;
      return { ...rest, text: text ?? "" };
    });
  }

  // ── Group DMs ───────────────────────────────────────────────────

  /** Create a group DM. Caller is implicitly added as a member. */
  async createGroup(
    creatorTid: bigint,
    groupId: string,
    name: string,
    memberTids: bigint[],
    appSigningKey: Uint8Array
  ): Promise<{ groupId: string }> {
    const wireBody = {
      group_id: groupId,
      name,
      member_tids: memberTids.map((m) => m.toString()),
    };
    const message = this.sign(
      MessageType.DM_GROUP_CREATE,
      creatorTid,
      wireBody,
      appSigningKey
    );
    const result = await this.post<{ group_id: string }>(
      "/v1/dm/groups/create",
      message
    );
    return { groupId: result.group_id };
  }

  /**
   * Send a group DM. Caller must encrypt the plaintext separately
   * for each recipient using their x25519 pubkey (see encryptDm).
   */
  async sendToGroup(
    senderTid: bigint,
    groupId: string,
    senderX25519: string,
    ciphertexts: Array<{ recipientTid: bigint; ciphertext: string; nonce: string }>,
    appSigningKey: Uint8Array
  ): Promise<{ hash: string; groupId: string }> {
    const wireBody = {
      group_id: groupId,
      sender_x25519: senderX25519,
      ciphertexts: ciphertexts.map((c) => ({
        recipient_tid: c.recipientTid.toString(),
        ciphertext: c.ciphertext,
        nonce: c.nonce,
      })),
    };
    const message = this.sign(
      MessageType.DM_GROUP_SEND,
      senderTid,
      wireBody,
      appSigningKey
    );
    const result = await this.post<{ hash: string; group_id: string }>(
      "/v1/dm/groups/send",
      message
    );
    return { hash: result.hash, groupId: result.group_id };
  }

  async groupsForTid(tid: bigint): Promise<DmGroupSummary[]> {
    const res = await fetch(`${this.hubUrl}/v1/dm/groups/member/${tid}`);
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { groups: DmGroupSummary[] };
    return json.groups;
  }

  async getGroup(groupId: string): Promise<DmGroup | null> {
    const res = await fetch(
      `${this.hubUrl}/v1/dm/groups/${encodeURIComponent(groupId)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    return (await res.json()) as DmGroup;
  }

  /** Mark progress through a conversation. Monotonic — a stale call
   *  won't roll back a more recent receipt. */
  async markRead(
    tid: bigint,
    conversationId: string,
    lastReadHash: string,
    appSigningKey: Uint8Array
  ): Promise<void> {
    const wireBody = {
      conversation_id: conversationId,
      last_read_hash: lastReadHash,
    };
    const message = this.sign(
      MessageType.DM_READ,
      tid,
      wireBody,
      appSigningKey
    );
    await this.post("/v1/dm/read", message);
  }

  /** Other participants' last-read state in a conversation. */
  async getReads(conversationId: string): Promise<DmReadReceipt[]> {
    const res = await fetch(
      `${this.hubUrl}/v1/dm/conversations/${encodeURIComponent(conversationId)}/reads`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { reads: DmReadReceipt[] };
    return json.reads;
  }

  async groupMessages(
    groupId: string,
    tid: bigint,
    limit = 50
  ): Promise<EncryptedGroupDm[]> {
    const params = new URLSearchParams({
      tid: tid.toString(),
      limit: String(limit),
    });
    const res = await fetch(
      `${this.hubUrl}/v1/dm/groups/${encodeURIComponent(groupId)}/messages?${params}`
    );
    if (!res.ok) throw new Error(`Hub error: ${res.status}`);
    const json = (await res.json()) as { messages: EncryptedGroupDm[] };
    return json.messages;
  }

  private network(): Network {
    return this.config.cluster === "mainnet-beta"
      ? Network.MAINNET
      : Network.DEVNET;
  }

  /**
   * Build a DM envelope. The wire body is signed verbatim so the bytes
   * the hub receives match the bytes hashed for the signature.
   */
  private sign(
    type: MessageType,
    tid: bigint,
    wireBody: Record<string, unknown>,
    appSigningKey: Uint8Array
  ): TribeMessage {
    const data: MessageData = {
      type,
      tid,
      timestamp: Math.floor(Date.now() / 1000),
      network: this.network(),
      body: wireBody as unknown as MessageData["body"],
    };
    return signJsonMessage(data, appSigningKey);
  }

  private async post<T = unknown>(
    path: string,
    message: TribeMessage
  ): Promise<T> {
    const envelope = {
      protocolVersion: message.protocolVersion,
      data: {
        ...message.data,
        tid: message.data.tid.toString(),
      },
      hash: toBase64(message.hash),
      signature: toBase64(message.signature),
      signer: toBase64(message.signer),
    };
    const res = await fetch(`${this.hubUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${path} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
  }
}
