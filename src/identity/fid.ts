import { PublicKey, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";

export interface FidRecord {
  fid: bigint;
  custodyAddress: PublicKey;
  recoveryAddress: PublicKey;
  registeredAt: number;
}

export class FidClient {
  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {}

  /**
   * Register a new FID for the connected wallet.
   */
  async register(recoveryAddress: PublicKey): Promise<{ fid: bigint; txSig: string }> {
    // TODO: Call fid_registry.register(recovery_address)
    // 1. Derive GlobalState PDA
    // 2. Derive FidRecord PDA (using next fid counter)
    // 3. Derive CustodyLookup PDA
    // 4. Send transaction
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Transfer FID custody to a new wallet.
   */
  async transfer(fid: bigint, newCustody: PublicKey): Promise<TransactionSignature> {
    // TODO: Call fid_registry.transfer(new_custody)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Recover FID using the recovery address.
   */
  async recover(fid: bigint, newCustody: PublicKey): Promise<TransactionSignature> {
    // TODO: Call fid_registry.recover(new_custody)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Change the recovery address for an FID.
   */
  async changeRecovery(fid: bigint, newRecovery: PublicKey): Promise<TransactionSignature> {
    // TODO: Call fid_registry.change_recovery(new_recovery)
    throw new Error("Not implemented — requires IDL from anchor build");
  }

  /**
   * Fetch an FID record by FID number.
   */
  async getFid(fid: bigint): Promise<FidRecord | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fid"), this.fidToBuffer(fid)],
      this.config.programIds.fidRegistry
    );

    const accountInfo = await this.provider.connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    // TODO: Deserialize using IDL types
    return null;
  }

  /**
   * Look up an FID by custody address.
   */
  async getFidByCustody(custodyAddress: PublicKey): Promise<bigint | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), custodyAddress.toBuffer()],
      this.config.programIds.fidRegistry
    );

    const accountInfo = await this.provider.connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    // TODO: Deserialize CustodyLookup
    return null;
  }

  private fidToBuffer(fid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(fid);
    return buf;
  }
}
