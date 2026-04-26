import { AnchorProvider } from "@coral-xyz/anchor";
import { NetworkConfig } from "./network/types";
import { DEVNET_CONFIG } from "./network/devnet";
import { MAINNET_CONFIG } from "./network/mainnet";
import { LOCALNET_CONFIG } from "./network/localnet";
import { ExecutionProvider } from "./execution/types";
import { DirectSolanaProvider } from "./execution/direct-solana";
import { TidClient } from "./identity/tid";
import { AppKeyClient } from "./identity/app-keys";
import { UsernameClient } from "./identity/usernames";
import { GraphClient } from "./social/graph";
import { TweetClient } from "./social/tweets";
import { DmClient } from "./social/dms";
import { UserDataClient } from "./social/user-data";
import { ChannelClient } from "./social/channels";
import { BookmarkClient } from "./social/bookmarks";

export interface TribeClientOptions {
  /** Override the default ExecutionProvider (DirectSolanaProvider). */
  execution?: ExecutionProvider;
}

/**
 * TribeClient — main entry point for the Tribe Protocol SDK.
 *
 * Usage:
 *   const tribe = TribeClient.forDevnet(provider);
 *   await tribe.identity.register(recoveryAddress);
 *   await tribe.social.follow(myTid, targetTid);
 *   await tribe.tweets.publish(myTid, "Hello Tribe!", signingKey);
 */
export class TribeClient {
  public readonly config: NetworkConfig;
  public readonly identity: {
    tid: TidClient;
    appKeys: AppKeyClient;
    usernames: UsernameClient;
  };
  public readonly social: GraphClient;
  public readonly tweets: TweetClient;
  public readonly dms: DmClient;
  public readonly userData: UserDataClient;
  public readonly channels: ChannelClient;
  public readonly bookmarks: BookmarkClient;

  private constructor(
    provider: AnchorProvider,
    config: NetworkConfig,
    options?: TribeClientOptions
  ) {
    this.config = config;

    // Identity modules (always talk directly to Solana).
    this.identity = {
      tid: new TidClient(provider, config),
      appKeys: new AppKeyClient(provider, config),
      usernames: new UsernameClient(provider, config),
    };

    // Social graph — uses ExecutionProvider (swappable).
    const execution = options?.execution ?? new DirectSolanaProvider(provider, config);
    this.social = new GraphClient(execution);

    // Tweets — always talk to the hub.
    this.tweets = new TweetClient(config);

    // DMs — encrypted client-side, hub stores ciphertext only.
    this.dms = new DmClient(config);

    // Profile fields (bio, displayName, pfpUrl, ...).
    this.userData = new UserDataClient(config);

    // Channel directory + create/join/leave.
    this.channels = new ChannelClient(config);

    // Per-TID bookmark list.
    this.bookmarks = new BookmarkClient(config);
  }

  /** Connect to Solana devnet. */
  static forDevnet(provider: AnchorProvider, options?: TribeClientOptions): TribeClient {
    return new TribeClient(provider, DEVNET_CONFIG, options);
  }

  /** Connect to Solana mainnet. */
  static forMainnet(provider: AnchorProvider, options?: TribeClientOptions): TribeClient {
    return new TribeClient(provider, MAINNET_CONFIG, options);
  }

  /** Connect to local validator. */
  static forLocalnet(provider: AnchorProvider, options?: TribeClientOptions): TribeClient {
    return new TribeClient(provider, LOCALNET_CONFIG, options);
  }

  /** Connect with a custom network config. */
  static forNetwork(
    provider: AnchorProvider,
    config: NetworkConfig,
    options?: TribeClientOptions
  ): TribeClient {
    return new TribeClient(provider, config, options);
  }
}
