import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/channel_registry.json";
import { NetworkConfig } from "../network/types";

export enum ChannelKindOnchain {
  General = 1,
  City = 2,
  Interest = 3,
}

export interface ChannelRecord {
  pda: PublicKey;
  id: string;
  kind: ChannelKindOnchain;
  owner: PublicKey;
  ownerTid: bigint;
  metadataHash: Buffer;
  latitude: number;
  longitude: number;
  hasLocation: boolean;
  createdAt: number;
  updatedAt: number;
}

const RESERVED_GENERAL_ID = "general";
const ID_REGEX = /^[a-z0-9-]+$/;

/** On-chain channel ownership. Pairs with the off-chain ChannelClient
 * (under tribe.channels) which talks to the hub for membership and
 * tweet feeds — this one is the single source of truth for who owns
 * the slug across the entire network. */
export class ChannelOnchainClient {
  private program: Program;
  private programId: PublicKey;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
    this.programId = config.programIds.channelRegistry;
  }

  /** PDA: ["channel", id_bytes]. */
  deriveChannel(id: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("channel"), Buffer.from(id)],
      this.programId
    );
  }

  /** Run the same regex / length / reserved-id checks the program does. */
  private validateId(id: string): void {
    if (!id) throw new Error("channel id must not be empty");
    if (id.length > 32) {
      throw new Error("on-chain channel id is capped at 32 bytes");
    }
    if (!ID_REGEX.test(id)) {
      throw new Error("channel id must match /^[a-z0-9-]+$/");
    }
    if (id === RESERVED_GENERAL_ID) {
      throw new Error('"general" is reserved for the hub-seeded default channel');
    }
  }

  /** Claim ownership of an unregistered channel id. First-write-wins. */
  async registerChannel(args: {
    id: string;
    kind: ChannelKindOnchain.City | ChannelKindOnchain.Interest;
    ownerTid: bigint;
    latitude?: number;
    longitude?: number;
    /** Hash of the off-chain CHANNEL_ADD envelope. */
    metadataHash: Uint8Array;
  }): Promise<{ channel: PublicKey; txSig: TransactionSignature }> {
    this.validateId(args.id);
    // The TS type already excludes ChannelKindOnchain.General; the
    // program rejects it at runtime as a defense in depth.
    if (args.metadataHash.length !== 32) {
      throw new Error("metadataHash must be exactly 32 bytes");
    }
    const owner = this.provider.wallet.publicKey;
    const [channel] = this.deriveChannel(args.id);
    const hasLocation =
      args.latitude !== undefined || args.longitude !== undefined;

    const txSig = await this.program.methods
      .registerChannel(
        args.id,
        args.kind,
        new BN(args.ownerTid.toString()),
        args.latitude ?? 0,
        args.longitude ?? 0,
        hasLocation,
        Array.from(args.metadataHash)
      )
      .accounts({
        channel,
        owner,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { channel, txSig };
  }

  /** Owner-only update of location / metadata. Kind is immutable. */
  async updateChannel(args: {
    id: string;
    latitude?: number;
    longitude?: number;
    metadataHash: Uint8Array;
  }): Promise<TransactionSignature> {
    this.validateId(args.id);
    if (args.metadataHash.length !== 32) {
      throw new Error("metadataHash must be exactly 32 bytes");
    }
    const owner = this.provider.wallet.publicKey;
    const [channel] = this.deriveChannel(args.id);
    const hasLocation =
      args.latitude !== undefined || args.longitude !== undefined;

    return this.program.methods
      .updateChannel(
        args.id,
        args.latitude ?? 0,
        args.longitude ?? 0,
        hasLocation,
        Array.from(args.metadataHash)
      )
      .accounts({
        channel,
        owner,
      })
      .rpc();
  }

  /** Owner-only ownership transfer. V1 simple transfer (no two-step accept). */
  async transferChannel(args: {
    id: string;
    newOwner: PublicKey;
    newOwnerTid: bigint;
  }): Promise<TransactionSignature> {
    this.validateId(args.id);
    const owner = this.provider.wallet.publicKey;
    const [channel] = this.deriveChannel(args.id);
    return this.program.methods
      .transferChannel(args.id, new BN(args.newOwnerTid.toString()))
      .accounts({
        channel,
        owner,
        newOwner: args.newOwner,
      })
      .rpc();
  }

  async getChannel(id: string): Promise<ChannelRecord | null> {
    const [pda] = this.deriveChannel(id);
    try {
      const raw = (await (this.program.account as any).channelRecord.fetch(
        pda
      )) as {
        id: number[];
        idLen: number;
        kind: number;
        owner: PublicKey;
        ownerTid: BN;
        metadataHash: number[];
        latitude: number;
        longitude: number;
        hasLocation: boolean;
        createdAt: BN;
        updatedAt: BN;
      };
      const idStr = Buffer.from(raw.id.slice(0, raw.idLen)).toString("utf8");
      return {
        pda,
        id: idStr,
        kind: raw.kind as ChannelKindOnchain,
        owner: raw.owner,
        ownerTid: BigInt(raw.ownerTid.toString()),
        metadataHash: Buffer.from(raw.metadataHash),
        latitude: raw.latitude,
        longitude: raw.longitude,
        hasLocation: raw.hasLocation,
        createdAt: raw.createdAt.toNumber(),
        updatedAt: raw.updatedAt.toNumber(),
      };
    } catch {
      return null;
    }
  }
}
