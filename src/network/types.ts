import { PublicKey } from "@solana/web3.js";

export interface NetworkConfig {
  cluster: "devnet" | "mainnet-beta" | "localnet";
  rpcUrl: string;
  wsUrl: string;
  programIds: {
    fidRegistry: PublicKey;
    appKeyRegistry: PublicKey;
    usernameRegistry: PublicKey;
    socialGraph: PublicKey;
  };
  castServerUrl: string;
  indexerUrl: string;
}
