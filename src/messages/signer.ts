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
  BookmarkBody,
  ChannelAddBody,
  ChannelMembershipBody,
  PollAddBody,
  PollVoteBody,
  EventAddBody,
  EventRsvpBody,
  TaskAddBody,
  TaskTransitionBody,
  CrowdfundAddBody,
  CrowdfundPledgeBody,
  TipAddBody,
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
 */
function encodeMessageData(data: MessageData): Uint8Array {
  const protoData: tribe.IMessageData = {
    type: data.type as number as tribe.MessageType,
    tid: Number(data.tid),
    timestamp: data.timestamp,
    network: data.network as number as tribe.Network,
  };

  switch (data.type) {
    case MessageType.TWEET_ADD: {
      const body = data.body as TweetAddBody;
      protoData.tweetAdd = {
        text: body.text,
        mentions: body.mentions.map(Number),
        embeds: body.embeds,
        parentHash: body.parentHash || new Uint8Array(0),
        channelId: body.channelId || "",
      };
      break;
    }
    case MessageType.TWEET_REMOVE: {
      const body = data.body as TweetRemoveBody;
      protoData.tweetRemove = {
        targetHash: body.targetHash,
      };
      break;
    }
    case MessageType.REACTION_ADD:
    case MessageType.REACTION_REMOVE: {
      const body = data.body as ReactionBody;
      protoData.reaction = {
        type: body.type as number as tribe.ReactionType,
        targetHash: body.targetHash,
      };
      break;
    }
    case MessageType.USER_DATA_ADD: {
      const body = data.body as UserDataBody;
      protoData.userData = {
        field: body.field,
        value: body.value,
      };
      break;
    }
    case MessageType.BOOKMARK_ADD:
    case MessageType.BOOKMARK_REMOVE: {
      const body = data.body as BookmarkBody;
      protoData.bookmark = {
        targetHash: body.targetHash,
      };
      break;
    }
    case MessageType.CHANNEL_ADD: {
      const body = data.body as ChannelAddBody;
      protoData.channelAdd = {
        channelId: body.channelId,
        name: body.name,
        description: body.description ?? "",
        kind: body.kind as number as tribe.ChannelKind,
        latitude: body.latitude ?? 0,
        longitude: body.longitude ?? 0,
      };
      break;
    }
    case MessageType.CHANNEL_JOIN:
    case MessageType.CHANNEL_LEAVE: {
      const body = data.body as ChannelMembershipBody;
      protoData.channelMembership = {
        channelId: body.channelId,
      };
      break;
    }
    case MessageType.POLL_ADD: {
      const body = data.body as PollAddBody;
      protoData.pollAdd = {
        pollId: body.pollId,
        question: body.question,
        options: body.options,
        expiresAt: body.expiresAt ?? 0,
        channelId: body.channelId ?? "",
      };
      break;
    }
    case MessageType.POLL_VOTE: {
      const body = data.body as PollVoteBody;
      protoData.pollVote = {
        pollId: body.pollId,
        optionIndex: body.optionIndex,
      };
      break;
    }
    case MessageType.EVENT_ADD: {
      const body = data.body as EventAddBody;
      protoData.eventAdd = {
        eventId: body.eventId,
        title: body.title,
        description: body.description ?? "",
        startsAt: body.startsAt,
        endsAt: body.endsAt ?? 0,
        locationText: body.locationText ?? "",
        latitude: body.latitude ?? 0,
        longitude: body.longitude ?? 0,
        channelId: body.channelId ?? "",
        imageUrl: body.imageUrl ?? "",
      };
      break;
    }
    case MessageType.EVENT_RSVP: {
      const body = data.body as EventRsvpBody;
      protoData.eventRsvp = {
        eventId: body.eventId,
        status: body.status,
      };
      break;
    }
    case MessageType.TASK_ADD: {
      const body = data.body as TaskAddBody;
      protoData.taskAdd = {
        taskId: body.taskId,
        title: body.title,
        description: body.description ?? "",
        rewardText: body.rewardText ?? "",
        channelId: body.channelId ?? "",
      };
      break;
    }
    case MessageType.TASK_CLAIM:
    case MessageType.TASK_COMPLETE: {
      const body = data.body as TaskTransitionBody;
      protoData.taskTransition = {
        taskId: body.taskId,
      };
      break;
    }
    case MessageType.CROWDFUND_ADD: {
      const body = data.body as CrowdfundAddBody;
      protoData.crowdfundAdd = {
        crowdfundId: body.crowdfundId,
        title: body.title,
        description: body.description ?? "",
        goalAmount: body.goalAmount,
        currency: body.currency ?? "",
        deadlineAt: body.deadlineAtUnix ?? 0,
        imageUrl: body.imageUrl ?? "",
        channelId: body.channelId ?? "",
      };
      break;
    }
    case MessageType.CROWDFUND_PLEDGE: {
      const body = data.body as CrowdfundPledgeBody;
      protoData.crowdfundPledge = {
        crowdfundId: body.crowdfundId,
        amount: body.amount,
        currency: body.currency ?? "",
      };
      break;
    }
    case MessageType.TIP_ADD: {
      const body = data.body as TipAddBody;
      protoData.tipAdd = {
        recipientTid: Number(body.recipientTid),
        amount: body.amount,
        currency: body.currency ?? "",
        targetHash: body.targetHash ?? "",
        txSignature: body.txSignature ?? "",
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
