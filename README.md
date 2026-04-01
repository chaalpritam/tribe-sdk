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
const { fid } = await tribe.identity.fid.register(recoveryAddress);

// Add an app key
await tribe.identity.appKeys.addAppKey(fid, appPubkey, AppKeyScope.Full);

// Register a username
await tribe.identity.usernames.register(fid, "alice");

// Follow someone
await tribe.social.follow(myFid, targetFid);

// Publish a cast
await tribe.casts.publish(myFid, "Hello Tribe!", signingKey);
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
| `tribe.identity.fid` | Register/transfer/recover FIDs |
| `tribe.identity.appKeys` | Add/revoke/rotate app keys |
| `tribe.identity.usernames` | Register/renew/transfer usernames |
| `tribe.social` | Follow/unfollow (via ExecutionProvider) |
| `tribe.casts` | Publish/read casts (via cast server) |

## Related Repos

- [tribe-protocol](../tribe-protocol) — Solana programs (Anchor)
- [tribe-cast-server](../tribe-cast-server) — Cast message server
- [tribe-indexer](../tribe-indexer) — Event indexer + read API

## License

MIT
