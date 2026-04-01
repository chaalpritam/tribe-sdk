import { AnchorProvider } from "@coral-xyz/anchor";
import { NetworkConfig } from "./network/types";
import { DEVNET_CONFIG } from "./network/devnet";
import { MAINNET_CONFIG } from "./network/mainnet";
import { LOCALNET_CONFIG } from "./network/localnet";
import { ExecutionProvider } from "./execution/types";
import { DirectSolanaProvider } from "./execution/direct-solana";
import { FidClient } from "./identity/fid";
import { AppKeyClient } from "./identity/app-keys";
import { UsernameClient } from "./identity/usernames";
import { GraphClient } from "./social/graph";
import { CastClient } from "./social/casts";

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
 *   await tribe.social.follow(myFid, targetFid);
 *   await tribe.casts.publish(myFid, "Hello Tribe!", signingKey);
 */
export class TribeClient {
  public readonly config: NetworkConfig;
  public readonly identity: {
    fid: FidClient;
    appKeys: AppKeyClient;
    usernames: UsernameClient;
  };
  public readonly social: GraphClient;
  public readonly casts: CastClient;

  private constructor(
    provider: AnchorProvider,
    config: NetworkConfig,
    options?: TribeClientOptions
  ) {
    this.config = config;

    // Identity modules (always talk directly to Solana).
    this.identity = {
      fid: new FidClient(provider, config),
      appKeys: new AppKeyClient(provider, config),
      usernames: new UsernameClient(provider, config),
    };

    // Social graph — uses ExecutionProvider (swappable).
    const execution = options?.execution ?? new DirectSolanaProvider(provider, config);
    this.social = new GraphClient(execution);

    // Casts — always talk to cast server.
    this.casts = new CastClient(config);
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
