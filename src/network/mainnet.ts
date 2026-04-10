import { PublicKey } from "@solana/web3.js";
import { NetworkConfig } from "./types";

export const MAINNET_CONFIG: NetworkConfig = {
  cluster: "mainnet-beta",
  rpcUrl: "https://api.mainnet-beta.solana.com",
  wsUrl: "wss://api.mainnet-beta.solana.com",
  programIds: {
    // Placeholder — replace with actual program IDs after mainnet deployment
    tidRegistry: new PublicKey("11111111111111111111111111111111"),
    appKeyRegistry: new PublicKey("11111111111111111111111111111111"),
    usernameRegistry: new PublicKey("11111111111111111111111111111111"),
    socialGraph: new PublicKey("11111111111111111111111111111111"),
  },
  tweetServerUrl: "https://tweet.tribe.protocol",
  indexerUrl: "https://indexer.tribe.protocol",
  erServerUrl: "https://er.tribe.protocol",
  hubUrl: "https://hub.tribe.protocol",
};
