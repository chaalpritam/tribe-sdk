import { PublicKey } from "@solana/web3.js";
import { NetworkConfig } from "./types";

export const DEVNET_CONFIG: NetworkConfig = {
  cluster: "devnet",
  rpcUrl: "https://api.devnet.solana.com",
  wsUrl: "wss://api.devnet.solana.com",
  programIds: {
    tidRegistry: new PublicKey("4BSmJmRGQWKgioP9DG2bUuRS9U3V6soRauU7Nv6yGvHD"),
    appKeyRegistry: new PublicKey("5LtbFUeAoXWRovGpyWnRJhiCS62XsTYKVErT9kPpv4hN"),
    usernameRegistry: new PublicKey("65oKjSjcGYR61ASzDYczbodz6H8TARtJyQGvb5V9y9W1"),
    socialGraph: new PublicKey("8kKnWvbmTjWq5uPePk79RRbQMAXCszNFzHdRwUS4N74w"),
  },
  // Override these via custom config for non-local deployments
  tweetServerUrl: "http://localhost:3000",
  indexerUrl: "http://localhost:3001",
  erServerUrl: "http://localhost:3003",
  hubUrl: "http://localhost:4000",
};
