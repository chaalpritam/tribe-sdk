import nacl from "tweetnacl";
import { hash as blake3Hash } from "blake3";
import { tribe } from "./proto/message";
import { MessageData, TribeMessage, PROTOCOL_VERSION, MessageType, ReactionType } from "./types";
import { GENERAL_CHANNEL_ID } from "./types";
import type {
  TweetAddBody,
  TweetRemoveBody,
  ReactionBody,
  UserDataBody,
} from "./types";

/**
 * Sign a message using an ed25519 app key.
 *
 * The hash binds the FULL data envelope (header + body) so that hubs
 * recomputing blake3(dataBytes) can reject any tampered projection.
 * dataBytes is exposed on the returned message so the caller can ship
 * it on the wire (base64-encoded) and the hub can re-verify integrity.
 */
export function signMessage(
  data: MessageData,
  signingKey: Uint8Array
): TribeMessage {
  const dataBytes = encodeMessageData(data);
  const hash = blake3Hash(dataBytes) as Uint8Array;
  const signature = nacl.sign.detached(hash, signingKey);
  const publicKey = nacl.sign.keyPair.fromSecretKey(signingKey).publicKey;

  return {
    protocolVersion: PROTOCOL_VERSION,
    data,
    dataBytes,
    hash,
    signature,
    signer: publicKey,
  };
}

/**
 * Sign a message using a deterministic JSON encoding of `data`.
 *
 * Used for DM bodies (DM_*) — those will migrate to protobuf in a
 * follow-up; until then, the SDK and hub agree to hash the JSON form.
 * As with signMessage, dataBytes carries the exact bytes that were
 * hashed so receivers can recompute and verify integrity.
 */
export function signJsonMessage(
  data: MessageData,
  signingKey: Uint8Array
): TribeMessage {
  const dataBytes = new TextEncoder().encode(jsonStringify(data));
  const hash = blake3Hash(dataBytes) as Uint8Array;
  const signature = nacl.sign.detached(hash, signingKey);
  const publicKey = nacl.sign.keyPair.fromSecretKey(signingKey).publicKey;

  return {
    protocolVersion: PROTOCOL_VERSION,
    data,
    dataBytes,
    hash,
    signature,
    signer: publicKey,
  };
}

function jsonStringify(value: unknown): string {
  return JSON.stringify(value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
}

/**
 * Verify a message signature.
 */
export function verifyMessage(message: TribeMessage): boolean {
  return nacl.sign.detached.verify(
    message.hash,
    message.signature,
    message.signer
  );
}

/**
 * Encode MessageData to bytes using protobuf serialization.
 *
 * Every MessageType that signMessage can be called with MUST set its
 * oneof body here. A missing case means the body is silently dropped
 * from the hashed bytes — the signature would only authenticate the
 * header (type/tid/timestamp/network), letting an attacker swap the
 * body without invalidating the signature. Throwing on unsupported
 * types makes the failure loud instead of silent.
 *
 * Field reads accept both snake_case and camelCase keys: the wire
 * format hubs/tribe-app already speak is snake_case (matching the .proto
 * source), but several callers in this SDK pass camelCase via typed
 * body objects. Honouring both keeps the body bytes hashed regardless
 * of which convention the caller used.
 */
function encodeMessageData(data: MessageData): Uint8Array {
  const protoData: tribe.IMessageData = {
    type: data.type as number as tribe.MessageType,
    tid: Number(data.tid),
    timestamp: data.timestamp,
    network: data.network as number as tribe.Network,
  };

  const body = data.body as unknown as Record<string, unknown>;

  switch (data.type) {
    case MessageType.TWEET_ADD: {
      protoData.tweetAdd = {
        text: pickString(body, "text"),
        mentions: pickArray(body, "mentions").map((m) => Number(m)),
        embeds: pickArray<string>(body, "embeds"),
        parentHash: pickBytes(body, "parent_hash", "parentHash") ?? new Uint8Array(0),
        channelId: pickString(body, "channel_id", "channelId"),
      };
      break;
    }
    case MessageType.TWEET_REMOVE: {
      protoData.tweetRemove = {
        targetHash: pickBytes(body, "target_hash", "targetHash") ?? new Uint8Array(0),
      };
      break;
    }
    case MessageType.REACTION_ADD:
    case MessageType.REACTION_REMOVE: {
      protoData.reaction = {
        type: pickNumber(body, "type") as number as tribe.ReactionType,
        targetHash: pickBytes(body, "target_hash", "targetHash") ?? new Uint8Array(0),
      };
      break;
    }
    case MessageType.USER_DATA_ADD: {
      protoData.userData = {
        field: pickString(body, "field"),
        value: pickString(body, "value"),
      };
      break;
    }
    case MessageType.BOOKMARK_ADD:
    case MessageType.BOOKMARK_REMOVE: {
      protoData.bookmark = {
        targetHash: pickString(body, "target_hash", "targetHash"),
      };
      break;
    }
    case MessageType.CHANNEL_ADD: {
      protoData.channelAdd = {
        channelId: pickString(body, "channel_id", "channelId"),
        name: pickString(body, "name"),
        description: pickString(body, "description"),
        kind: pickNumber(body, "kind") as number as tribe.ChannelKind,
        latitude: pickNumber(body, "latitude"),
        longitude: pickNumber(body, "longitude"),
      };
      break;
    }
    case MessageType.CHANNEL_JOIN:
    case MessageType.CHANNEL_LEAVE: {
      protoData.channelMembership = {
        channelId: pickString(body, "channel_id", "channelId"),
      };
      break;
    }
    case MessageType.POLL_ADD: {
      protoData.pollAdd = {
        pollId: pickString(body, "poll_id", "pollId"),
        question: pickString(body, "question"),
        options: pickArray<string>(body, "options"),
        expiresAt: pickNumber(body, "expires_at", "expiresAt"),
        channelId: pickString(body, "channel_id", "channelId"),
      };
      break;
    }
    case MessageType.POLL_VOTE: {
      protoData.pollVote = {
        pollId: pickString(body, "poll_id", "pollId"),
        optionIndex: pickNumber(body, "option_index", "optionIndex"),
      };
      break;
    }
    case MessageType.EVENT_ADD: {
      protoData.eventAdd = {
        eventId: pickString(body, "event_id", "eventId"),
        title: pickString(body, "title"),
        description: pickString(body, "description"),
        startsAt: pickNumber(body, "starts_at", "startsAt"),
        endsAt: pickNumber(body, "ends_at", "endsAt"),
        locationText: pickString(body, "location_text", "locationText"),
        latitude: pickNumber(body, "latitude"),
        longitude: pickNumber(body, "longitude"),
        channelId: pickString(body, "channel_id", "channelId"),
        imageUrl: pickString(body, "image_url", "imageUrl"),
      };
      break;
    }
    case MessageType.EVENT_RSVP: {
      protoData.eventRsvp = {
        eventId: pickString(body, "event_id", "eventId"),
        status: pickString(body, "status"),
      };
      break;
    }
    case MessageType.TASK_ADD: {
      protoData.taskAdd = {
        taskId: pickString(body, "task_id", "taskId"),
        title: pickString(body, "title"),
        description: pickString(body, "description"),
        rewardText: pickString(body, "reward_text", "rewardText"),
        channelId: pickString(body, "channel_id", "channelId"),
      };
      break;
    }
    case MessageType.TASK_CLAIM:
    case MessageType.TASK_COMPLETE: {
      protoData.taskTransition = {
        taskId: pickString(body, "task_id", "taskId"),
      };
      break;
    }
    case MessageType.CROWDFUND_ADD: {
      protoData.crowdfundAdd = {
        crowdfundId: pickString(body, "crowdfund_id", "crowdfundId"),
        title: pickString(body, "title"),
        description: pickString(body, "description"),
        goalAmount: pickNumber(body, "goal_amount", "goalAmount"),
        currency: pickString(body, "currency"),
        deadlineAt: pickNumber(body, "deadline_at", "deadlineAtUnix", "deadlineAt"),
        imageUrl: pickString(body, "image_url", "imageUrl"),
        channelId: pickString(body, "channel_id", "channelId"),
      };
      break;
    }
    case MessageType.CROWDFUND_PLEDGE: {
      protoData.crowdfundPledge = {
        crowdfundId: pickString(body, "crowdfund_id", "crowdfundId"),
        amount: pickNumber(body, "amount"),
        currency: pickString(body, "currency"),
      };
      break;
    }
    case MessageType.TIP_ADD: {
      protoData.tipAdd = {
        recipientTid: Number(pickString(body, "recipient_tid", "recipientTid") || pickNumber(body, "recipient_tid", "recipientTid")),
        amount: pickNumber(body, "amount"),
        currency: pickString(body, "currency"),
        targetHash: pickString(body, "target_hash", "targetHash"),
        txSignature: pickString(body, "tx_signature", "txSignature"),
      };
      break;
    }
    default:
      throw new Error(
        `signMessage: MessageType ${MessageType[data.type] ?? data.type} has no protobuf body encoder. Add a case in encodeMessageData() or use signJsonMessage() if a proto schema doesn't exist.`,
      );
  }

  return tribe.MessageData.encode(protoData).finish();
}

function pickString(
  body: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const k of keys) {
    const v = body[k];
    if (typeof v === "string") return v;
  }
  return "";
}

function pickNumber(
  body: Record<string, unknown>,
  ...keys: string[]
): number {
  for (const k of keys) {
    const v = body[k];
    if (typeof v === "number") return v;
    if (typeof v === "bigint") return Number(v);
    if (typeof v === "string" && v !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function pickArray<T>(
  body: Record<string, unknown>,
  ...keys: string[]
): T[] {
  for (const k of keys) {
    const v = body[k];
    if (Array.isArray(v)) return v as T[];
  }
  return [];
}

function pickBytes(
  body: Record<string, unknown>,
  ...keys: string[]
): Uint8Array | undefined {
  for (const k of keys) {
    const v = body[k];
    if (v instanceof Uint8Array) return v;
    if (typeof v === "string" && v !== "") {
      // Heuristic: treat hex (only 0-9a-f, even length) as hex; otherwise base64.
      // Hashes are typically delivered as hex from on-chain reads or as base64
      // from gossip/wire — both decode to the same bytes.
      try {
        if (/^[0-9a-fA-F]+$/.test(v) && v.length % 2 === 0) {
          return new Uint8Array(Buffer.from(v, "hex"));
        }
        return new Uint8Array(Buffer.from(v, "base64"));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/**
 * Decode protobuf-encoded MessageData bytes back to MessageData.
 */
export function decodeMessageData(bytes: Uint8Array): MessageData {
  const proto = tribe.MessageData.decode(bytes);

  let body;
  if (proto.tweetAdd) {
    body = {
      text: proto.tweetAdd.text,
      mentions: (proto.tweetAdd.mentions || []).map(BigInt),
      embeds: proto.tweetAdd.embeds || [],
      parentHash: proto.tweetAdd.parentHash?.length ? proto.tweetAdd.parentHash : undefined,
      channelId: proto.tweetAdd.channelId || GENERAL_CHANNEL_ID,
    } as TweetAddBody;
  } else if (proto.tweetRemove) {
    body = { targetHash: proto.tweetRemove.targetHash! } as TweetRemoveBody;
  } else if (proto.reaction) {
    body = {
      type: proto.reaction.type as number as ReactionType,
      targetHash: proto.reaction.targetHash!,
    } as ReactionBody;
  } else if (proto.userData) {
    body = {
      field: proto.userData.field,
      value: proto.userData.value,
    } as UserDataBody;
  } else {
    throw new Error(`Unknown message body in type ${proto.type}`);
  }

  return {
    type: proto.type as number as MessageType,
    tid: BigInt(proto.tid?.toString() ?? "0"),
    timestamp: proto.timestamp,
    network: proto.network as number,
    body,
  };
}
