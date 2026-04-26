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
    tipRegistry: new PublicKey("11111111111111111111111111111111"),
    crowdfundRegistry: new PublicKey("11111111111111111111111111111111"),
    taskRegistry: new PublicKey("11111111111111111111111111111111"),
    channelRegistry: new PublicKey("11111111111111111111111111111111"),
    karmaRegistry: new PublicKey("11111111111111111111111111111111"),
    pollRegistry: new PublicKey("11111111111111111111111111111111"),
    eventRegistry: new PublicKey("11111111111111111111111111111111"),
  },
  hubUrl: "https://hub.tribe.protocol",
  erServerUrl: "https://er.tribe.protocol",
};
