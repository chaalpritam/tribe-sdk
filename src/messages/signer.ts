import nacl from "tweetnacl";
import { hash as blake3Hash } from "blake3";
import { tribe } from "./proto/message";
import { MessageData, TribeMessage, PROTOCOL_VERSION, MessageType, ReactionType } from "./types";
import type { TweetAddBody, TweetRemoveBody, ReactionBody, UserDataBody } from "./types";

/**
 * Sign a message using an ed25519 app key.
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
    hash,
    signature,
    signer: publicKey,
  };
}

/**
 * Sign a message whose body has no protobuf schema (e.g. DMs). The hash
 * is taken over a deterministic JSON encoding of `data`. The hub never
 * recomputes the hash, only verifies signature against it, so any
 * deterministic encoding works as long as both sides agree.
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
 */
function encodeMessageData(data: MessageData): Uint8Array {
  const protoData: tribe.IMessageData = {
    type: data.type as number as tribe.MessageType,
    tid: Number(data.tid),
    timestamp: data.timestamp,
    network: data.network as number as tribe.Network,
  };

  // Set the oneof body field based on message type
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
      channelId: proto.tweetAdd.channelId || undefined,
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
