# Tribe SDK

TypeScript SDK for [Tribe Protocol](../tribe-protocol) — decentralized social on Solana.

## Install

```bash
pnpm add @tribe-protocol/sdk
```

## Quick Start

```typescript
import { TribeClient } from "@tribe-protocol/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";

// Connect to devnet
const provider = AnchorProvider.env();
const tribe = TribeClient.forDevnet(provider);

// Register identity
const { tid } = await tribe.identity.tid.register(recoveryAddress);

// Add an app key
await tribe.identity.appKeys.addAppKey(tid, appPubkey, AppKeyScope.Full);

// Register a username
await tribe.identity.usernames.register(tid, "alice");

// Follow someone
await tribe.social.follow(myTid, targetTid);

// Publish a tweet
await tribe.tweets.publish(myTid, "Hello Tribe!", signingKey);
```

## Network Switching

```typescript
// Devnet (default for development)
const tribe = TribeClient.forDevnet(provider);

// Mainnet
const tribe = TribeClient.forMainnet(provider);

// Local validator
const tribe = TribeClient.forLocalnet(provider);

// Custom config
const tribe = TribeClient.forNetwork(provider, myConfig);
```

## ExecutionProvider Pattern

Social graph operations go through an `ExecutionProvider` interface. The prototype uses `DirectSolanaProvider` (sends Anchor instructions directly to Solana). When the Ephemeral Rollup is built, swap with one line:

```typescript
import { EphemeralRollupProvider } from "@tribe-protocol/sdk";

const tribe = TribeClient.forDevnet(provider, {
  execution: new EphemeralRollupProvider(erEndpoint),
});
```

## Modules

| Module | Description |
|--------|-------------|
| `tribe.identity.tid` | Register/transfer/recover TIDs |
| `tribe.identity.appKeys` | Add/revoke/rotate app keys |
| `tribe.identity.usernames` | Register/renew/transfer usernames |
| `tribe.social` | Follow/unfollow (via ExecutionProvider) |
| `tribe.tweets` | Publish/read tweets (via tweet server) |

## Related Repos

- [tribe-protocol](../tribe-protocol) — Solana programs (Anchor)
- [tribe-tweet-server](../tribe-tweet-server) — Tweet message server
- [tribe-indexer](../tribe-indexer) — Event indexer + read API

## License

MIT
