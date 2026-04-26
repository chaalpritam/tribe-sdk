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
    tipRegistry: new PublicKey("TipReg1111111111111111111111111111111111111"),
    crowdfundRegistry: new PublicKey("CrowdF11111111111111111111111111111111111111"),
    taskRegistry: new PublicKey("TaskReg111111111111111111111111111111111111"),
    channelRegistry: new PublicKey("ChanReg111111111111111111111111111111111111"),
    karmaRegistry: new PublicKey("KarmaReg11111111111111111111111111111111111"),
    pollRegistry: new PublicKey("HPd8FqxVfoeBxwBr7wuKDeahgGX1V9UewxEWzjZY2SAm"),
    eventRegistry: new PublicKey("D2Gt2qkNAa8gZAmvqt3PWH39ydBL1cpwuXqeogkCoPRk"),
  },
  hubUrl: "http://localhost:4000",
  erServerUrl: "http://localhost:3003",
};
