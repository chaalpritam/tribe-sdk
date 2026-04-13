/**
 * End-to-end smoke test against devnet.
 *
 * Prerequisites:
 *   - Programs deployed to devnet
 *   - tribe-hub running on localhost:4000
 *   - Funded devnet wallet at ~/.config/solana/id.json
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import nacl from "tweetnacl";
import { TribeClient } from "../src/client";
import { DEVNET_CONFIG } from "../src/network/devnet";
import { NetworkConfig } from "../src/network/types";
import { AppKeyScope } from "../src/identity/app-keys";
import tidRegistryIdl from "../src/idl/tid_registry.json";
import socialGraphIdl from "../src/idl/social_graph.json";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const config: NetworkConfig = {
  ...DEVNET_CONFIG,
  hubUrl: "http://localhost:4000",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadKeypair(filePath: string): Keypair {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

function tidToBuffer(tid: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(tid);
  return buf;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function log(step: string, msg: string) {
  console.log(`\n[${step}] ${msg}`);
}

async function accountExists(connection: Connection, pubkey: PublicKey): Promise<boolean> {
  const info = await connection.getAccountInfo(pubkey);
  return info !== null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Tribe Protocol — Devnet Smoke Test ===\n");

  // -- Setup ----------------------------------------------------------------

  const walletPath = path.join(process.env.HOME!, ".config/solana/id.json");
  const payer = loadKeypair(walletPath);
  const connection = new Connection(config.rpcUrl, "confirmed");
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

  const tribe = TribeClient.forNetwork(provider, config);
  const tidProgram = new Program(tidRegistryIdl as any, provider);

  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Wallet:  ${payer.publicKey.toBase58()}`);
  console.log(`Balance: ${(balance / 1e9).toFixed(4)} SOL`);

  // -- Step 1: Initialize global state (idempotent) -------------------------

  log("1", "Initialize TID registry global state...");

  const [globalState] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    config.programIds.tidRegistry
  );

  if (await accountExists(connection, globalState)) {
    log("1", "Already initialized -- skipping.");
  } else {
    const tx = await tidProgram.methods
      .initialize()
      .accounts({
        globalState,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    log("1", `Initialized. tx: ${tx}`);
  }

  // -- Step 2: Register TID -------------------------------------------------

  log("2", "Registering TID...");

  const recoveryKeypair = Keypair.generate();
  let tid: bigint;

  const existingTid = await tribe.identity.tid.getTidByCustody(payer.publicKey);
  if (existingTid !== null) {
    tid = existingTid;
    log("2", `Wallet already has TID ${tid} -- skipping.`);
  } else {
    const result = await tribe.identity.tid.register(recoveryKeypair.publicKey);
    tid = result.tid;
    log("2", `Registered TID ${tid}. tx: ${result.txSig}`);
  }

  const tidRecord = await tribe.identity.tid.getTid(tid);
  console.log(`   TID:      ${tidRecord!.tid}`);
  console.log(`   Custody:  ${tidRecord!.custodyAddress.toBase58()}`);
  console.log(`   Recovery: ${tidRecord!.recoveryAddress.toBase58()}`);

  // -- Step 3: Add app key --------------------------------------------------

  log("3", "Adding app key...");

  const appKeyPair = nacl.sign.keyPair();
  const appPubkey = new PublicKey(appKeyPair.publicKey);

  const addKeyTx = await tribe.identity.appKeys.addAppKey(
    tid,
    appPubkey,
    AppKeyScope.Full,
    0
  );
  log("3", `Added app key ${appPubkey.toBase58()}. tx: ${addKeyTx}`);

  const appKeyRecord = await tribe.identity.appKeys.getAppKey(tid, appPubkey);
  console.log(`   Scope:    ${AppKeyScope[appKeyRecord!.scope]}`);
  console.log(`   Revoked:  ${appKeyRecord!.revoked}`);

  // -- Step 4: Register username (skip if TID already has one) ---------------

  log("4", "Registering username...");

  // Check if TID already has a username via the tid_username PDA
  const [tidUsernamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tid_username"), tidToBuffer(tid)],
    config.programIds.usernameRegistry
  );

  let username: string;
  if (await accountExists(connection, tidUsernamePda)) {
    log("4", "TID already has a username -- skipping registration.");
    // Fetch existing username by reading the reverse lookup
    username = "(existing)";
  } else {
    username = `smoketest${Date.now().toString(36)}`;
    const regTx = await tribe.identity.usernames.register(tid, username);
    log("4", `Registered "${username}.tribe". tx: ${regTx}`);

    const usernameRecord = await tribe.identity.usernames.getUsername(username);
    console.log(`   Username: ${usernameRecord!.username}`);
    console.log(`   TID:      ${usernameRecord!.tid}`);
  }

  // -- Step 5: Init social profiles & follow ---------------------------------

  log("5", "Initializing social profile & following...");

  // Register a second TID to follow
  const user2 = Keypair.generate();

  // Fund user2 from main wallet
  const fundTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: user2.publicKey,
      lamports: 0.05 * 1e9,
    })
  );
  await provider.sendAndConfirm(fundTx);
  log("5", `Funded user2 (${user2.publicKey.toBase58().slice(0, 8)}...) with 0.05 SOL`);

  // Register TID for user2
  const user2Wallet = new Wallet(user2);
  const user2Provider = new AnchorProvider(connection, user2Wallet, { commitment: "confirmed" });
  const user2Tribe = TribeClient.forNetwork(user2Provider, config);
  const user2Result = await user2Tribe.identity.tid.register(Keypair.generate().publicKey);
  const tid2 = user2Result.tid;
  log("5", `User2 registered TID ${tid2}`);

  // Init social profiles (SDK doesn't expose initProfile directly)
  async function initProfile(profileTid: bigint, signerProvider: AnchorProvider) {
    const prog = new Program(socialGraphIdl as any, signerProvider);
    const tidRec = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), tidToBuffer(profileTid)],
      config.programIds.tidRegistry
    )[0];
    const [profile] = PublicKey.findProgramAddressSync(
      [Buffer.from("social_profile"), tidToBuffer(profileTid)],
      config.programIds.socialGraph
    );

    // Skip if profile already exists
    if (await accountExists(connection, profile)) return;

    return prog.methods
      .initProfile()
      .accounts({
        tidRecord: tidRec,
        socialProfile: profile,
        custody: signerProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  await initProfile(tid, provider);
  log("5", `Social profile ready for TID ${tid}`);

  await initProfile(tid2, user2Provider);
  log("5", `Social profile ready for TID ${tid2}`);

  // Follow
  const followTx = await tribe.social.follow(tid, tid2);
  log("5", `TID ${tid} followed TID ${tid2}. tx: ${followTx}`);

  const isFollowing = await tribe.social.isFollowing(tid, tid2);
  console.log(`   isFollowing: ${isFollowing}`);

  const profile1 = await tribe.social.getProfile(tid);
  console.log(`   TID ${tid} following: ${profile1!.followingCount}`);

  const profile2 = await tribe.social.getProfile(tid2);
  console.log(`   TID ${tid2} followers: ${profile2!.followersCount}`);

  // -- Step 6: Publish a tweet -----------------------------------------------

  log("6", "Publishing tweet...");

  // Brief wait for on-chain app key to be visible to tweet-server RPC
  await sleep(3000);

  console.log(`   Using app key: ${appPubkey.toBase58()}`);
  console.log(`   Signer bytes (hex): ${Buffer.from(appKeyPair.publicKey).toString("hex")}`);

  const tweetHash = await tribe.tweets.publish(
    tid,
    "Hello Tribe! First tweet on devnet.",
    appKeyPair.secretKey
  );
  log("6", `Published tweet. hash: ${tweetHash}`);

  const tweet = await tribe.tweets.getTweet(tweetHash);
  if (tweet) {
    console.log(`   Text: "${tweet.text}"`);
    console.log(`   TID:  ${tweet.tid}`);
  } else {
    console.log(`   getTweet returned null (hash lookup may need URL encoding)`);
  }

  const page = await tribe.tweets.getTweetsByTid(tid);
  console.log(`   Tweets for TID ${tid}: ${page.tweets.length}`);

  // -- Step 7: Verify hub ------------------------------------------------

  log("7", "Waiting for hub to index events (10s)...");
  await sleep(10000);

  const userRes = await fetch(`${config.hubUrl}/v1/user/${tid}`);
  if (userRes.ok) {
    const userData = await userRes.json();
    console.log(`   Hub user:`, JSON.stringify(userData));
  } else {
    console.log(`   Hub user lookup: ${userRes.status} (may need more time)`);
  }

  const feedRes = await fetch(`${config.hubUrl}/v1/feed/${tid}`);
  if (feedRes.ok) {
    const feedData = await feedRes.json();
    console.log(`   Hub feed tweets: ${feedData.tweets?.length ?? 0}`);
  } else {
    console.log(`   Hub feed: ${feedRes.status}`);
  }

  // -- Done ------------------------------------------------------------------

  console.log("\n=== Smoke test complete! ===\n");
  console.log("Summary:");
  console.log(`  TID registered:     ${tid}`);
  console.log(`  App key added:      ${appPubkey.toBase58()}`);
  console.log(`  Username:           ${username}.tribe`);
  console.log(`  Following TID:      ${tid2}`);
  console.log(`  Tweet published:    ${tweetHash}`);
  console.log(`  Hub:                http://localhost:4000`);
}

main().catch((err) => {
  console.error("\nSmoke test failed:", err);
  process.exit(1);
});
