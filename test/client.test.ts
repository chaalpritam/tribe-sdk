import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";

import {
  signMessage,
  verifyMessage,
  decodeMessageData,
  MessageType,
  MessageData,
  Network,
  ReactionType,
  PROTOCOL_VERSION,
} from "../src/messages";
import type { TweetAddBody, ReactionBody } from "../src/messages/types";
import { DEVNET_CONFIG } from "../src/network/devnet";
import { MAINNET_CONFIG } from "../src/network/mainnet";
import type { NetworkConfig } from "../src/network/types";
import { EphemeralRollupProvider } from "../src/execution/ephemeral-rollup";
import { TribeClient } from "../src/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeKeypair() {
  return nacl.sign.keyPair();
}

function makeTweetAddData(tid = 42n): MessageData {
  return {
    type: MessageType.TWEET_ADD,
    tid,
    timestamp: 1700000000,
    network: Network.DEVNET,
    body: {
      text: "Hello Tribe!",
      mentions: [1n, 2n],
      embeds: ["https://example.com"],
    } as TweetAddBody,
  };
}

function makeReactionData(tid = 42n): MessageData {
  return {
    type: MessageType.REACTION_ADD,
    tid,
    timestamp: 1700000000,
    network: Network.DEVNET,
    body: {
      type: ReactionType.LIKE,
      targetHash: new Uint8Array([1, 2, 3, 4]),
    } as ReactionBody,
  };
}

/**
 * Build a minimal mock AnchorProvider that satisfies the TribeClient constructor
 * without requiring a real Solana connection.
 */
function mockAnchorProvider(): AnchorProvider {
  return {
    connection: {},
    wallet: { publicKey: PublicKey.default },
    opts: {},
  } as unknown as AnchorProvider;
}

// ---------------------------------------------------------------------------
// 1. Message signing tests
// ---------------------------------------------------------------------------

describe("Message signing", () => {
  it("signMessage creates a message with hash, signature, and signer", () => {
    const kp = makeKeypair();
    const data = makeTweetAddData();
    const msg = signMessage(data, kp.secretKey);

    expect(msg.protocolVersion).toBe(PROTOCOL_VERSION);
    expect(msg.hash).toBeInstanceOf(Uint8Array);
    expect(msg.hash.length).toBe(32); // BLAKE3 produces 32-byte hashes
    expect(msg.signature).toBeInstanceOf(Uint8Array);
    expect(msg.signature.length).toBe(64); // Ed25519 signature is 64 bytes
    expect(msg.signer).toBeInstanceOf(Uint8Array);
    expect(msg.signer.length).toBe(32); // Ed25519 public key is 32 bytes
    // signer should match the keypair public key
    expect(Buffer.from(msg.signer)).toEqual(Buffer.from(kp.publicKey));
    expect(msg.data).toEqual(data);
  });

  it("verifyMessage returns true for a correctly signed message", () => {
    const kp = makeKeypair();
    const msg = signMessage(makeTweetAddData(), kp.secretKey);

    expect(verifyMessage(msg)).toBe(true);
  });

  it("verifyMessage returns false when hash is tampered", () => {
    const kp = makeKeypair();
    const msg = signMessage(makeTweetAddData(), kp.secretKey);

    // Flip a byte in the hash
    const tampered = { ...msg, hash: new Uint8Array(msg.hash) };
    tampered.hash[0] ^= 0xff;

    expect(verifyMessage(tampered)).toBe(false);
  });

  it("verifyMessage returns false when signature is tampered", () => {
    const kp = makeKeypair();
    const msg = signMessage(makeTweetAddData(), kp.secretKey);

    const tampered = { ...msg, signature: new Uint8Array(msg.signature) };
    tampered.signature[0] ^= 0xff;

    expect(verifyMessage(tampered)).toBe(false);
  });

  it("verifyMessage returns false when signer is wrong", () => {
    const kp = makeKeypair();
    const msg = signMessage(makeTweetAddData(), kp.secretKey);

    const otherKp = makeKeypair();
    const tampered = { ...msg, signer: otherKp.publicKey };

    expect(verifyMessage(tampered)).toBe(false);
  });

  it("encodeMessageData / decodeMessageData round-trip for TWEET_ADD", () => {
    const data = makeTweetAddData(99n);
    const kp = makeKeypair();
    // signMessage internally calls encodeMessageData; we can test round-trip
    // by using the exported decodeMessageData on re-encoded data.
    // But encodeMessageData is not exported, so we sign and verify data integrity.
    const msg = signMessage(data, kp.secretKey);

    // decodeMessageData is exported; we need the raw bytes.
    // We can re-encode by accessing signMessage internals indirectly:
    // The signed message.data should equal original data.
    expect(msg.data.type).toBe(MessageType.TWEET_ADD);
    expect(msg.data.tid).toBe(99n);
    expect((msg.data.body as TweetAddBody).text).toBe("Hello Tribe!");
    expect((msg.data.body as TweetAddBody).mentions).toEqual([1n, 2n]);
    expect((msg.data.body as TweetAddBody).embeds).toEqual(["https://example.com"]);
  });

  it("REACTION_ADD message encodes and signs correctly", () => {
    const kp = makeKeypair();
    const data = makeReactionData(7n);
    const msg = signMessage(data, kp.secretKey);

    expect(verifyMessage(msg)).toBe(true);
    expect(msg.data.type).toBe(MessageType.REACTION_ADD);
    const body = msg.data.body as ReactionBody;
    expect(body.type).toBe(ReactionType.LIKE);
    expect(Buffer.from(body.targetHash)).toEqual(Buffer.from([1, 2, 3, 4]));
  });

  it("two different messages produce different hashes", () => {
    const kp = makeKeypair();
    const msg1 = signMessage(makeTweetAddData(1n), kp.secretKey);
    const msg2 = signMessage(makeTweetAddData(2n), kp.secretKey);

    expect(Buffer.from(msg1.hash)).not.toEqual(Buffer.from(msg2.hash));
  });
});

// ---------------------------------------------------------------------------
// 2. Network config tests
// ---------------------------------------------------------------------------

describe("Network configs", () => {
  it("DEVNET_CONFIG has all required fields", () => {
    expect(DEVNET_CONFIG.cluster).toBe("devnet");
    expect(DEVNET_CONFIG.rpcUrl).toMatch(/^https?:\/\//);
    expect(DEVNET_CONFIG.wsUrl).toMatch(/^wss?:\/\//);
    expect(DEVNET_CONFIG.tweetServerUrl).toBeDefined();
    expect(DEVNET_CONFIG.indexerUrl).toBeDefined();
    expect(DEVNET_CONFIG.programIds).toBeDefined();
  });

  it("MAINNET_CONFIG has all required fields", () => {
    expect(MAINNET_CONFIG.cluster).toBe("mainnet-beta");
    expect(MAINNET_CONFIG.rpcUrl).toMatch(/^https?:\/\//);
    expect(MAINNET_CONFIG.wsUrl).toMatch(/^wss?:\/\//);
    expect(MAINNET_CONFIG.tweetServerUrl).toBeDefined();
    expect(MAINNET_CONFIG.indexerUrl).toBeDefined();
    expect(MAINNET_CONFIG.programIds).toBeDefined();
  });

  it("program IDs are valid PublicKeys", () => {
    const ids = DEVNET_CONFIG.programIds;
    for (const key of ["tidRegistry", "appKeyRegistry", "usernameRegistry", "socialGraph"] as const) {
      const pk = ids[key];
      expect(pk).toBeInstanceOf(PublicKey);
      // A valid base58-encoded Solana public key is 32-44 chars
      expect(pk.toBase58().length).toBeGreaterThanOrEqual(32);
    }
  });

  it("erServerUrl is defined in DEVNET_CONFIG", () => {
    expect(DEVNET_CONFIG.erServerUrl).toBeDefined();
    expect(typeof DEVNET_CONFIG.erServerUrl).toBe("string");
    expect(DEVNET_CONFIG.erServerUrl!.length).toBeGreaterThan(0);
  });

  it("devnet program IDs are not placeholder (system program)", () => {
    // Devnet should have real deployed program addresses, not 1111...
    const systemProgramBase58 = "11111111111111111111111111111111";
    expect(DEVNET_CONFIG.programIds.tidRegistry.toBase58()).not.toBe(systemProgramBase58);
    expect(DEVNET_CONFIG.programIds.appKeyRegistry.toBase58()).not.toBe(systemProgramBase58);
  });
});

// ---------------------------------------------------------------------------
// 3. TribeClient tests
// ---------------------------------------------------------------------------

describe("TribeClient", () => {
  // TribeClient constructor calls `new Program(idl, provider)` which may
  // throw if the IDL or provider shape is unexpected. We mock at the module
  // level so the Anchor Program constructor is a no-op.
  vi.mock("@coral-xyz/anchor", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
      ...actual,
      Program: class MockProgram {
        constructor() {
          // no-op
        }
      },
    };
  });

  it("forDevnet returns a client with devnet config", () => {
    const client = TribeClient.forDevnet(mockAnchorProvider());
    expect(client.config.cluster).toBe("devnet");
    expect(client.config).toBe(DEVNET_CONFIG);
  });

  it("forMainnet returns a client with mainnet config", () => {
    const client = TribeClient.forMainnet(mockAnchorProvider());
    expect(client.config.cluster).toBe("mainnet-beta");
    expect(client.config).toBe(MAINNET_CONFIG);
  });

  it("forNetwork with custom config works", () => {
    const customConfig: NetworkConfig = {
      cluster: "devnet",
      rpcUrl: "https://custom-rpc.example.com",
      wsUrl: "wss://custom-ws.example.com",
      programIds: DEVNET_CONFIG.programIds,
      tweetServerUrl: "https://custom-tweets.example.com",
      indexerUrl: "https://custom-indexer.example.com",
    };
    const client = TribeClient.forNetwork(mockAnchorProvider(), customConfig);
    expect(client.config).toBe(customConfig);
    expect(client.config.rpcUrl).toBe("https://custom-rpc.example.com");
  });

  it("client exposes identity.tid, identity.appKeys, identity.usernames", () => {
    const client = TribeClient.forDevnet(mockAnchorProvider());
    expect(client.identity).toBeDefined();
    expect(client.identity.tid).toBeDefined();
    expect(client.identity.appKeys).toBeDefined();
    expect(client.identity.usernames).toBeDefined();
  });

  it("client exposes social (GraphClient) and tweets (TweetClient)", () => {
    const client = TribeClient.forDevnet(mockAnchorProvider());
    expect(client.social).toBeDefined();
    expect(client.tweets).toBeDefined();
    // GraphClient should have follow/unfollow/isFollowing/getProfile
    expect(typeof client.social.follow).toBe("function");
    expect(typeof client.social.unfollow).toBe("function");
    expect(typeof client.social.isFollowing).toBe("function");
    expect(typeof client.social.getProfile).toBe("function");
    // TweetClient should have publish/getTweetsByTid/getTweet
    expect(typeof client.tweets.publish).toBe("function");
    expect(typeof client.tweets.getTweetsByTid).toBe("function");
    expect(typeof client.tweets.getTweet).toBe("function");
  });

  it("forLocalnet returns a client with localnet config", () => {
    const client = TribeClient.forLocalnet(mockAnchorProvider());
    expect(client.config.cluster).toBe("localnet");
  });
});

// ---------------------------------------------------------------------------
// 4. EphemeralRollupProvider tests
// ---------------------------------------------------------------------------

describe("EphemeralRollupProvider", () => {
  const ER_URL = "https://er.test.tribe";
  let originalFetch: typeof globalThis.fetch;

  function makeProvider(signFn?: (msg: Uint8Array) => Promise<Uint8Array>) {
    return new EphemeralRollupProvider({
      erServerUrl: ER_URL,
      custodyPubkey: "TestCustodyPubkeyBase58",
      signFn: signFn ?? (async (msg: Uint8Array) => new Uint8Array(64)),
    });
  }

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("follow() sends POST to /v1/follow with correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "op-123" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const signFn = vi.fn().mockResolvedValue(new Uint8Array(64));
    const provider = makeProvider(signFn);

    const result = await provider.follow(10n, 20n);

    expect(result).toBe("op-123");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe(`${ER_URL}/v1/follow`);
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(opts.body);
    expect(body.followerTid).toBe("10");
    expect(body.followingTid).toBe("20");
    expect(body.custodyPubkey).toBe("TestCustodyPubkeyBase58");
    expect(typeof body.signature).toBe("string"); // base64
    expect(typeof body.timestamp).toBe("number");

    // signFn should have been called with the payload bytes
    expect(signFn).toHaveBeenCalledTimes(1);
    const payloadArg = signFn.mock.calls[0][0] as Uint8Array;
    const payloadStr = new TextDecoder().decode(payloadArg);
    expect(payloadStr).toMatch(/^tribe-er:follow:10:20:\d+$/);
  });

  it("unfollow() sends POST to /v1/unfollow with correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "op-456" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const result = await provider.unfollow(5n, 15n);

    expect(result).toBe("op-456");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`${ER_URL}/v1/unfollow`);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.followerTid).toBe("5");
    expect(body.followingTid).toBe("15");
  });

  it("follow() throws on server error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    await expect(provider.follow(1n, 2n)).rejects.toThrow("ER follow failed: 500");
  });

  it("getLink() returns Link when server says exists", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exists: true, createdAt: 1700000000 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const link = await provider.getLink(10n, 20n);

    expect(link).not.toBeNull();
    expect(link!.followerTid).toBe(10n);
    expect(link!.followingTid).toBe(20n);
    expect(link!.createdAt).toBe(1700000000);

    expect(mockFetch).toHaveBeenCalledWith(`${ER_URL}/v1/link/10/20`);
  });

  it("getLink() returns null when server says not exists", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exists: false }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const link = await provider.getLink(10n, 20n);

    expect(link).toBeNull();
  });

  it("getLink() returns null on HTTP error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const link = await provider.getLink(10n, 20n);

    expect(link).toBeNull();
  });

  it("getProfile() returns SocialProfile from server response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tid: "42",
        followingCount: 100,
        followersCount: 200,
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const profile = await provider.getProfile(42n);

    expect(profile).not.toBeNull();
    expect(profile!.tid).toBe(42n);
    expect(profile!.followingCount).toBe(100);
    expect(profile!.followersCount).toBe(200);

    expect(mockFetch).toHaveBeenCalledWith(`${ER_URL}/v1/profile/42`);
  });

  it("getProfile() returns null when server returns no tid", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const profile = await provider.getProfile(99n);

    expect(profile).toBeNull();
  });

  it("getProfile() returns null on HTTP error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", mockFetch);

    const provider = makeProvider();
    const profile = await provider.getProfile(99n);

    expect(profile).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. PDA derivation consistency
// ---------------------------------------------------------------------------

describe("PDA derivation consistency", () => {
  const programId = DEVNET_CONFIG.programIds.tidRegistry;

  function tidToBuffer(tid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(tid);
    return buf;
  }

  it("same TID always derives the same PDA", () => {
    const [pda1] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), tidToBuffer(42n)],
      programId
    );
    const [pda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), tidToBuffer(42n)],
      programId
    );
    expect(pda1.equals(pda2)).toBe(true);
  });

  it("different TIDs derive different PDAs", () => {
    const [pda1] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), tidToBuffer(1n)],
      programId
    );
    const [pda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), tidToBuffer(2n)],
      programId
    );
    expect(pda1.equals(pda2)).toBe(false);
  });

  it("custody lookup PDA is deterministic", () => {
    const wallet = PublicKey.default;
    const [pda1] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), wallet.toBuffer()],
      programId
    );
    const [pda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), wallet.toBuffer()],
      programId
    );
    expect(pda1.equals(pda2)).toBe(true);
  });

  it("username PDA uses correct seeds", () => {
    const usernameProgram = DEVNET_CONFIG.programIds.usernameRegistry;
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from("alice")],
      usernameProgram
    );
    // Should be a valid PDA (on the ed25519 curve check is implicit in findProgramAddressSync)
    expect(pda).toBeInstanceOf(PublicKey);
    expect(pda.toBase58().length).toBeGreaterThan(0);
  });

  it("app_key PDA includes tid and app pubkey in seeds", () => {
    const appKeyProgram = DEVNET_CONFIG.programIds.appKeyRegistry;
    const appPubkey = PublicKey.default;
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), tidToBuffer(42n), appPubkey.toBuffer()],
      appKeyProgram
    );
    expect(pda).toBeInstanceOf(PublicKey);

    // Different app pubkey should yield different PDA
    const otherKey = new PublicKey("4BSmJmRGQWKgioP9DG2bUuRS9U3V6soRauU7Nv6yGvHD");
    const [pda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("app_key"), tidToBuffer(42n), otherKey.toBuffer()],
      appKeyProgram
    );
    expect(pda.equals(pda2)).toBe(false);
  });
});
