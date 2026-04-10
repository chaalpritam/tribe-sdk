import { PublicKey } from "@solana/web3.js";

export interface NetworkConfig {
  cluster: "devnet" | "mainnet-beta" | "localnet";
  rpcUrl: string;
  wsUrl: string;
  programIds: {
    tidRegistry: PublicKey;
    appKeyRegistry: PublicKey;
    usernameRegistry: PublicKey;
    socialGraph: PublicKey;
  };
  tweetServerUrl: string;
  indexerUrl: string;
  erServerUrl?: string;
  hubUrl?: string;
}
