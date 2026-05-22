import { PublicKey } from "@solana/web3.js";

/** On-chain username PDAs use lowercase seeds (see username-registry register.rs). */
export function usernameRecordSeed(username: string): Buffer {
  return Buffer.from(username.toLowerCase(), "utf-8");
}

export function deriveUsernameRecordPda(
  username: string,
  programId: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("username"), usernameRecordSeed(username)],
    programId
  );
  return pda;
}
