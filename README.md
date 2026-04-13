# tribe-sdk

TypeScript SDK for interacting with the Tribe protocol on Solana. Provides a unified client for identity management, social graph operations, tweet publishing, and message encoding.

## Installation

```bash
pnpm add @tribe-protocol/sdk
```

or

```bash
npm install @tribe-protocol/sdk
```

## Quick Start

```typescript
import { TribeClient } from '@tribe-protocol/sdk';

const client = TribeClient.forDevnet(wallet);

// Register TID
await client.identity.tid.register();

// Add app key
await client.identity.appKeys.addKey(tid, appPubkey, scope);

// Register username
await client.identity.usernames.register(tid, "alice");

// Follow someone
await client.social.follow(myTid, targetTid);

// Publish tweet
await client.tweets.publish(tid, "Hello Tribe!", signingKey);
```

## Modules

### Identity

On-chain identity primitives backed by Solana programs.

- **TidClient** (`client.identity.tid`) — Register, transfer, and recover Tribe IDs (TIDs). Methods include `register()`, `getTid()`, and `getTidByCustody()`.
- **AppKeyClient** (`client.identity.appKeys`) — Add, revoke, and rotate ed25519 app signing keys scoped to a TID.
- **UsernameClient** (`client.identity.usernames`) — Register, renew, and transfer human-readable usernames.

### Social

Social graph interactions routed through the ExecutionProvider.

- **GraphClient** (`client.social`) — `follow()`, `unfollow()`, `getLink()`, `getProfile()`.

### Tweets

Off-chain tweet storage via the hub over HTTP.

- **TweetClient** (`client.tweets`) — `publish()`, query tweets by TID, get a tweet by its blake3 hash. The client builds a signed `TribeMessage`, then POSTs it to the configured hub endpoint.

### Messages

Low-level message encoding used internally by TweetClient and available for direct use.

- **Protobuf encoding** — Messages are serialized with the `TribeMessage` protobuf schema defined in `proto/message.proto`.
- **ed25519 signing** — Each message is signed with the sender's app key using tweetnacl.
- **blake3 hashing** — The serialized `MessageData` is hashed with blake3 to produce a content-addressable message hash.

## Message Format

All off-chain actions are represented as `TribeMessage` protobufs:

```
TribeMessage
  protocol_version  uint32
  data              MessageData
  hash              bytes          // blake3(data)
  signature         bytes          // ed25519 over hash
  signer            bytes          // app key pubkey
```

`MessageData` contains a type discriminator and a typed body:

| MessageType       | Description                    |
|-------------------|--------------------------------|
| `TWEET_ADD`       | Publish a new tweet            |
| `TWEET_REMOVE`    | Delete a tweet by hash         |
| `REACTION_ADD`    | Like or recast a tweet         |
| `REACTION_REMOVE` | Remove a reaction              |
| `LINK_ADD`        | Add a social graph link        |
| `LINK_REMOVE`     | Remove a social graph link     |
| `USER_DATA_ADD`   | Set profile field (bio, pfp)   |
| `USERNAME_PROOF`  | Prove username ownership       |
| `CHANNEL_ADD`     | Create a channel               |
| `CHANNEL_JOIN`    | Join a channel                 |
| `CHANNEL_LEAVE`   | Leave a channel                |

Tweet text has a maximum length of 320 characters. Tweets can include mentions (TID references), embeds (URLs), a parent hash (for replies), and a channel ID.

## Network Configuration

The SDK ships with built-in configs for each environment:

```typescript
// Devnet (default for development)
const client = TribeClient.forDevnet(provider);

// Mainnet
const client = TribeClient.forMainnet(provider);

// Local validator
const client = TribeClient.forLocalnet(provider);

// Custom config
const client = TribeClient.forNetwork(provider, myConfig);
```

Each `NetworkConfig` includes:

- `cluster` — `"devnet"`, `"mainnet-beta"`, or `"localnet"`
- `rpcUrl` / `wsUrl` — Solana JSON-RPC and WebSocket endpoints
- `programIds` — Public keys for `tidRegistry`, `appKeyRegistry`, `usernameRegistry`, `socialGraph`
- `hubUrl` — HTTP endpoint for the hub (tweet storage, indexing, gossip)

## ExecutionProvider Pattern

Social graph operations are dispatched through an `ExecutionProvider` interface. The default implementation is `DirectSolanaProvider`, which sends Anchor instructions directly to Solana.

This abstraction exists so the execution layer can be swapped without changing application code. When the Ephemeral Rollup is ready, a single line change switches providers:

```typescript
import { EphemeralRollupProvider } from '@tribe-protocol/sdk';

const client = TribeClient.forDevnet(provider, {
  execution: new EphemeralRollupProvider(erEndpoint),
});
```

## Project Structure

```
tribe-sdk/
  proto/
    message.proto              # Protobuf schema for TribeMessage
  src/
    client.ts                  # TribeClient entry point
    index.ts                   # Public exports
    execution/
      types.ts                 # ExecutionProvider interface
      direct-solana.ts         # DirectSolanaProvider implementation
    identity/
      tid.ts                   # TidClient
      app-keys.ts              # AppKeyClient
      usernames.ts             # UsernameClient
    social/
      graph.ts                 # GraphClient (follow/unfollow)
      tweets.ts                # TweetClient (publish/query)
    messages/
      types.ts                 # MessageType, TribeMessage types
      signer.ts                # ed25519 signing + blake3 hashing
      proto/                   # Generated protobuf JS/TS
    network/
      types.ts                 # NetworkConfig interface
      devnet.ts                # Devnet configuration
      mainnet.ts               # Mainnet configuration
      localnet.ts              # Localnet configuration
    idl/                       # Anchor IDL JSON files
  test/
  tsconfig.json
  package.json
```

## Scripts

| Script        | Command                | Description                              |
|---------------|------------------------|------------------------------------------|
| `build`       | `pnpm build`           | Compile TypeScript to `dist/`            |
| `dev`         | `pnpm dev`             | Watch mode compilation                   |
| `test`        | `pnpm test`            | Run tests with Vitest                    |
| `test:watch`  | `pnpm test:watch`      | Run tests in watch mode                  |
| `lint`        | `pnpm lint`            | Type-check without emitting              |
| `proto`       | `pnpm proto`           | Regenerate protobuf JS/TS from `.proto`  |

## Dependencies

| Package              | Purpose                                    |
|----------------------|--------------------------------------------|
| `@coral-xyz/anchor`  | Solana program client framework (Anchor)   |
| `@solana/web3.js`    | Solana JSON-RPC and transaction primitives |
| `blake3`             | Fast hashing for message content addresses |
| `protobufjs`         | Protobuf serialization/deserialization     |
| `tweetnacl`          | ed25519 signing for app key signatures     |

## License

MIT
