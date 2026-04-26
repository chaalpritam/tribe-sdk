import { describe, it, expect } from "vitest";
import { generateDmKeypair, encryptDm, decryptDm } from "../src/social/dms";

describe("DM crypto roundtrip", () => {
  it("encrypts and decrypts back to plaintext for the recipient only", () => {
    const alice = generateDmKeypair();
    const bob = generateDmKeypair();

    const bobPub = Buffer.from(bob.publicKey).toString("base64");
    const plaintext = "hello bob, this is alice — hub never sees this";
    const enc = encryptDm(plaintext, bobPub, alice);

    const onWire = {
      hash: "x",
      sender_tid: "1",
      recipient_tid: "2",
      ciphertext: enc.ciphertext,
      nonce: enc.nonce,
      sender_x25519: enc.senderX25519,
      timestamp: new Date().toISOString(),
    };

    expect(decryptDm(onWire, bob)).toBe(plaintext);
    expect(decryptDm(onWire, generateDmKeypair())).toBeNull();
    expect(decryptDm(onWire, alice)).toBeNull();
  });
});
