import nacl from "tweetnacl";
import { MessageData, TribeMessage, PROTOCOL_VERSION } from "./types";

/**
 * Sign a message using an ed25519 app key.
 */
export function signMessage(
  data: MessageData,
  signingKey: Uint8Array
): TribeMessage {
  const dataBytes = encodeMessageData(data);
  const hash = blake3Hash(dataBytes);
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
 * Encode MessageData to bytes for hashing.
 * TODO: Replace with protobuf serialization.
 */
function encodeMessageData(data: MessageData): Uint8Array {
  const json = JSON.stringify(data, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
  return new TextEncoder().encode(json);
}

/**
 * Blake3 hash placeholder.
 * TODO: Replace with actual blake3 implementation.
 */
function blake3Hash(data: Uint8Array): Uint8Array {
  // Placeholder: using SHA-512 truncated to 32 bytes until blake3 is added
  const hashBuffer = nacl.hash(data);
  return hashBuffer.slice(0, 32);
}
