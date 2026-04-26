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

// Send an encrypted DM
await client.dms.send(myTid, recipientTid, "hey");

// Set a profile field
await client.userData.set(tid, "bio", "Building on Solana");

// Create a poll, event, task, crowdfund, or tip
await client.polls.create(tid, "Lunch?", ["Pizza", "Burgers"]);
await client.events.create(tid, { title: "Meetup", startsAt, location });
await client.tasks.create(tid, { title: "Translate docs", reward: "10 USDC" });
await client.crowdfunds.create(tid, { goal: 1000, currency: "USDC" });
await client.tips.send(senderTid, recipientTid, { amount: 5, currency: "USDC" });
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

### Messaging, Profiles & Discovery

Higher-level clients built on top of `TribeMessage` and the hub HTTP API.

- **DmClient** (`client.dms`) — Encrypted 1:1 and group DMs (x25519 key registration, sealed payloads, read receipts).
- **UserDataClient** (`client.userData`) — Profile fields (bio, pfp, display name) plus karma lookup.
- **ChannelClient** (`client.channels`) — Create / join / leave / list channels.
- **BookmarkClient** (`client.bookmarks`) — Save and remove bookmarked tweets.
- **SearchClient** (`client.search`) — Search tweets, users, and channels via the hub.

### Community Primitives

Off-chain message envelopes for community actions. The on-chain settlement programs (escrow, karma) are in progress; today these are signed messages persisted by the hub.

- **PollClient** (`client.polls`) — `create()`, `vote()`, `tally()`.
- **EventClient** (`client.events`) — `create()`, `rsvp()`, list upcoming events.
- **TaskClient** (`client.tasks`) — `create()`, `claim()`, `complete()` — local tasks with optional rewards.
- **CrowdfundClient** (`client.crowdfunds`) — `create()`, `pledge()` — community fundraising.
- **TipClient** (`client.tips`) — Send tips between TIDs, query history.

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
| `DM_KEY_REGISTER` | Publish x25519 pubkey for DMs  |
| `DM_SEND`         | Encrypted 1:1 direct message   |
| `DM_GROUP_CREATE` | Create a group DM              |
| `DM_GROUP_SEND`   | Encrypted group DM message     |
| `DM_READ`         | Mark DM(s) as read             |
| `BOOKMARK_ADD`    | Save a tweet to bookmarks      |
| `BOOKMARK_REMOVE` | Remove a bookmark              |
| `POLL_ADD`        | Create a poll                  |
| `POLL_VOTE`       | Vote on a poll                 |
| `EVENT_ADD`       | Create a local event           |
| `EVENT_RSVP`      | RSVP to an event               |
| `TASK_ADD`        | Create a local task            |
| `TASK_CLAIM`      | Claim a task                   |
| `TASK_COMPLETE`   | Mark a task complete           |
| `CROWDFUND_ADD`   | Create a crowdfund campaign    |
| `CROWDFUND_PLEDGE`| Pledge to a crowdfund          |
| `TIP_ADD`         | Send a tip to a TID            |

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
- `programIds` — Public keys for `tidRegistry`, `appKeyRegistry`, `usernameRegistry`, `socialGraph`, `hubRegistry`
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
      dms.ts                   # DmClient (1:1 + group DMs, encryption)
      user-data.ts             # UserDataClient (profile fields, karma)
      channels.ts              # ChannelClient (create/join/leave/list)
      bookmarks.ts             # BookmarkClient (save/remove)
      polls.ts                 # PollClient (create/vote/tally)
      events.ts                # EventClient (create/rsvp)
      tasks.ts                 # TaskClient (add/claim/complete)
      crowdfunds.ts            # CrowdfundClient (create/pledge)
      tips.ts                  # TipClient (send/history)
      search.ts                # SearchClient (tweets/users/channels)
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

## Related Repos

| Repo | Description |
|------|-------------|
| [tribe-protocol](../tribe-protocol) | Solana programs (Anchor) -- identity, keys, usernames, social graph |
| [tribe-hub](../tribe-hub) | Decentralized hub -- tweet storage, indexing, gossip sync |
| [tribe-er-server](../tribe-er-server) | Ephemeral Rollup sequencer -- instant follows, batched L1 settlement |
| [tribe-app](../tribe-app) | Next.js frontend -- 10 pages with multi-node failover |

## License

MIT
