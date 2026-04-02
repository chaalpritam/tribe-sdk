import { PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { NetworkConfig } from "../network/types";
import idl from "../idl/fid_registry.json";

export interface FidRecord {
  fid: bigint;
  custodyAddress: PublicKey;
  recoveryAddress: PublicKey;
  registeredAt: number;
}

export class FidClient {
  private program: Program;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
  }

  /**
   * Register a new FID for the connected wallet.
   */
  async register(recoveryAddress: PublicKey): Promise<{ fid: bigint; txSig: string }> {
    // Read current fid counter to derive the FidRecord PDA
    const [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      this.config.programIds.fidRegistry
    );

    const state = await (this.program.account as any).globalState.fetch(globalState);
    const nextFid = (state as any).fidCounter as BN;

    const [fidRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("fid"), nextFid.toArrayLike(Buffer, "le", 8)],
      this.config.programIds.fidRegistry
    );

    const [custodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), this.provider.wallet.publicKey.toBuffer()],
      this.config.programIds.fidRegistry
    );

    const txSig = await this.program.methods
      .register(recoveryAddress)
      .accounts({
        globalState,
        fidRecord,
        custodyLookup,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { fid: BigInt(nextFid.toString()), txSig };
  }

  /**
   * Transfer FID custody to a new wallet.
   */
  async transfer(fid: bigint, newCustody: PublicKey): Promise<TransactionSignature> {
    const [fidRecord] = this.deriveFidRecord(fid);

    const [oldCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), this.provider.wallet.publicKey.toBuffer()],
      this.config.programIds.fidRegistry
    );

    const [newCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), newCustody.toBuffer()],
      this.config.programIds.fidRegistry
    );

    return this.program.methods
      .transfer(newCustody)
      .accounts({
        fidRecord,
        oldCustodyLookup,
        newCustodyLookup,
        newCustody,
        custody: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Recover FID using the recovery address.
   */
  async recover(fid: bigint, newCustody: PublicKey): Promise<TransactionSignature> {
    const [fidRecord] = this.deriveFidRecord(fid);

    // Fetch current custody to derive old lookup PDA
    const record = await (this.program.account as any).fidRecord.fetch(fidRecord);
    const oldCustodyAddress = (record as any).custodyAddress as PublicKey;

    const [oldCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), oldCustodyAddress.toBuffer()],
      this.config.programIds.fidRegistry
    );

    const [newCustodyLookup] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), newCustody.toBuffer()],
      this.config.programIds.fidRegistry
    );

    return this.program.methods
      .recover(newCustody)
      .accounts({
        fidRecord,
        oldCustodyLookup,
        newCustodyLookup,
        newCustody,
        recovery: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  /**
   * Change the recovery address for an FID.
   */
  async changeRecovery(fid: bigint, newRecovery: PublicKey): Promise<TransactionSignature> {
    const [fidRecord] = this.deriveFidRecord(fid);

    return this.program.methods
      .changeRecovery(newRecovery)
      .accounts({
        fidRecord,
        custody: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  /**
   * Fetch an FID record by FID number.
   */
  async getFid(fid: bigint): Promise<FidRecord | null> {
    const [pda] = this.deriveFidRecord(fid);

    try {
      const account = await (this.program.account as any).fidRecord.fetch(pda);
      const data = account as any;
      return {
        fid: BigInt(data.fid.toString()),
        custodyAddress: data.custodyAddress,
        recoveryAddress: data.recoveryAddress,
        registeredAt: (data.registeredAt as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Look up an FID by custody address.
   */
  async getFidByCustody(custodyAddress: PublicKey): Promise<bigint | null> {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("custody"), custodyAddress.toBuffer()],
      this.config.programIds.fidRegistry
    );

    try {
      const account = await (this.program.account as any).custodyLookup.fetch(pda);
      return BigInt((account as any).fid.toString());
    } catch {
      return null;
    }
  }

  private deriveFidRecord(fid: bigint): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("fid"), this.fidToBuffer(fid)],
      this.config.programIds.fidRegistry
    );
  }

  private fidToBuffer(fid: bigint): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(fid);
    return buf;
  }
}
