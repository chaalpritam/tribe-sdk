import nacl from "tweetnacl";
import { hash as blake3Hash } from "blake3";
import { tribe } from "./proto/message";
import { MessageData, TribeMessage, PROTOCOL_VERSION, MessageType, ReactionType } from "./types";
import type { CastAddBody, CastRemoveBody, ReactionBody, UserDataBody } from "./types";

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
    fid: Number(data.fid),
    timestamp: data.timestamp,
    network: data.network as number as tribe.Network,
  };

  // Set the oneof body field based on message type
  switch (data.type) {
    case MessageType.CAST_ADD: {
      const body = data.body as CastAddBody;
      protoData.castAdd = {
        text: body.text,
        mentions: body.mentions.map(Number),
        embeds: body.embeds,
        parentHash: body.parentHash || new Uint8Array(0),
        channelId: body.channelId || "",
      };
      break;
    }
    case MessageType.CAST_REMOVE: {
      const body = data.body as CastRemoveBody;
      protoData.castRemove = {
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
  if (proto.castAdd) {
    body = {
      text: proto.castAdd.text,
      mentions: (proto.castAdd.mentions || []).map(BigInt),
      embeds: proto.castAdd.embeds || [],
      parentHash: proto.castAdd.parentHash?.length ? proto.castAdd.parentHash : undefined,
      channelId: proto.castAdd.channelId || undefined,
    } as CastAddBody;
  } else if (proto.castRemove) {
    body = { targetHash: proto.castRemove.targetHash! } as CastRemoveBody;
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
    fid: BigInt(proto.fid?.toString() ?? "0"),
    timestamp: proto.timestamp,
    network: proto.network as number,
    body,
  };
}
