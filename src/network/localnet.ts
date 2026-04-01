import { PublicKey } from "@solana/web3.js";
import { NetworkConfig } from "./types";

export const LOCALNET_CONFIG: NetworkConfig = {
  cluster: "localnet",
  rpcUrl: "http://localhost:8899",
  wsUrl: "ws://localhost:8900",
  programIds: {
    fidRegistry: new PublicKey("4BSmJmRGQWKgioP9DG2bUuRS9U3V6soRauU7Nv6yGvHD"),
    appKeyRegistry: new PublicKey("5LtbFUeAoXWRovGpyWnRJhiCS62XsTYKVErT9kPpv4hN"),
    usernameRegistry: new PublicKey("65oKjSjcGYR61ASzDYczbodz6H8TARtJyQGvb5V9y9W1"),
    socialGraph: new PublicKey("8kKnWvbmTjWq5uPePk79RRbQMAXCszNFzHdRwUS4N74w"),
  },
  castServerUrl: "http://localhost:3000",
  indexerUrl: "http://localhost:3001",
};
