import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import idl from "../idl/event_registry.json";
import { NetworkConfig } from "../network/types";

export enum RsvpStatus {
  Yes = 1,
  No = 2,
  Maybe = 3,
}

export interface CreatorEventState {
  creator: PublicKey;
  creatorTid: bigint;
  nextEventId: bigint;
}

export interface OnchainEvent {
  pda: PublicKey;
  creator: PublicKey;
  creatorTid: bigint;
  eventId: bigint;
  startsAt: number;
  endsAt: number;
  hasEnd: boolean;
  latitude: number;
  longitude: number;
  hasLocation: boolean;
  yesCount: number;
  noCount: number;
  maybeCount: number;
  createdAt: number;
  metadataHash: Buffer;
}

export interface OnchainRsvp {
  event: PublicKey;
  attendee: PublicKey;
  attendeeTid: bigint;
  status: RsvpStatus;
  respondedAt: number;
}

/** Anchor client for the on-chain event-registry program. Pair with
 * the off-chain EventClient (under tribe.events) which carries the
 * title / description / location_text in its EVENT_ADD envelope. */
export class EventOnchainClient {
  private program: Program;
  private programId: PublicKey;

  constructor(
    private provider: AnchorProvider,
    private config: NetworkConfig
  ) {
    this.program = new Program(idl as any, provider);
    this.programId = config.programIds.eventRegistry;
  }

  /** PDA: ["event-creator", creator_pubkey]. */
  deriveCreatorState(creator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("event-creator"), creator.toBuffer()],
      this.programId
    );
  }

  /** PDA: ["event", creator_pubkey, event_id_le]. */
  deriveEvent(creator: PublicKey, eventId: bigint): [PublicKey, number] {
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64LE(eventId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("event"), creator.toBuffer(), idBuf],
      this.programId
    );
  }

  /** PDA: ["rsvp", event_pubkey, attendee_pubkey]. */
  deriveRsvp(event: PublicKey, attendee: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("rsvp"), event.toBuffer(), attendee.toBuffer()],
      this.programId
    );
  }

  /** Idempotent. */
  async initCreatorState(creatorTid: bigint): Promise<{
    creatorState: PublicKey;
    txSig: TransactionSignature | null;
  }> {
    const creator = this.provider.wallet.publicKey;
    const [creatorState] = this.deriveCreatorState(creator);

    const existing = await this.program.provider.connection.getAccountInfo(
      creatorState
    );
    if (existing) return { creatorState, txSig: null };

    const txSig = await this.program.methods
      .initCreatorState(new BN(creatorTid.toString()))
      .accounts({
        creatorState,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { creatorState, txSig };
  }

  /** Create an event. Title / description / location_text live in
   * the off-chain EVENT_ADD envelope (only its hash is stored). */
  async createEvent(args: {
    startsAtUnix: number;
    endsAtUnix?: number;
    latitude?: number;
    longitude?: number;
    metadataHash: Uint8Array;
  }): Promise<{ event: PublicKey; eventId: bigint; txSig: TransactionSignature }> {
    if (args.metadataHash.length !== 32) {
      throw new Error("metadataHash must be exactly 32 bytes");
    }
    const creator = this.provider.wallet.publicKey;
    const [creatorState] = this.deriveCreatorState(creator);

    const state = (await (this.program.account as any).creatorEventState.fetch(
      creatorState
    )) as { nextEventId: BN };
    const eventId = BigInt(state.nextEventId.toString());

    const [event] = this.deriveEvent(creator, eventId);

    const hasEnd = args.endsAtUnix !== undefined;
    const endsAt = args.endsAtUnix ?? 0;
    const hasLocation =
      args.latitude !== undefined || args.longitude !== undefined;

    const txSig = await this.program.methods
      .createEvent(
        new BN(args.startsAtUnix),
        new BN(endsAt),
        hasEnd,
        args.latitude ?? 0,
        args.longitude ?? 0,
        hasLocation,
        Array.from(args.metadataHash)
      )
      .accounts({
        creatorState,
        event,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { event, eventId, txSig };
  }

  /** RSVP to an event. The init constraint on the Rsvp PDA prevents
   * a second RSVP from the same wallet — use updateRsvp to flip. */
  async rsvp(args: {
    event: PublicKey;
    attendeeTid: bigint;
    status: RsvpStatus;
  }): Promise<{ rsvpRecord: PublicKey; txSig: TransactionSignature }> {
    const attendee = this.provider.wallet.publicKey;
    const [rsvpRecord] = this.deriveRsvp(args.event, attendee);

    const txSig = await this.program.methods
      .rsvp(new BN(args.attendeeTid.toString()), args.status)
      .accounts({
        event: args.event,
        rsvpRecord,
        attendee,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { rsvpRecord, txSig };
  }

  /** Change a previous RSVP. Decrements the previous status's
   * counter and increments the new one. */
  async updateRsvp(args: {
    event: PublicKey;
    status: RsvpStatus;
  }): Promise<TransactionSignature> {
    const attendee = this.provider.wallet.publicKey;
    const [rsvpRecord] = this.deriveRsvp(args.event, attendee);
    return this.program.methods
      .updateRsvp(args.status)
      .accounts({
        event: args.event,
        rsvpRecord,
        attendee,
      })
      .rpc();
  }

  async getEvent(pda: PublicKey): Promise<OnchainEvent | null> {
    try {
      const raw = (await (this.program.account as any).event.fetch(pda)) as {
        creator: PublicKey;
        creatorTid: BN;
        eventId: BN;
        startsAt: BN;
        endsAt: BN;
        hasEnd: boolean;
        latitude: number;
        longitude: number;
        hasLocation: boolean;
        yesCount: number;
        noCount: number;
        maybeCount: number;
        createdAt: BN;
        metadataHash: number[];
      };
      return {
        pda,
        creator: raw.creator,
        creatorTid: BigInt(raw.creatorTid.toString()),
        eventId: BigInt(raw.eventId.toString()),
        startsAt: raw.startsAt.toNumber(),
        endsAt: raw.endsAt.toNumber(),
        hasEnd: raw.hasEnd,
        latitude: raw.latitude,
        longitude: raw.longitude,
        hasLocation: raw.hasLocation,
        yesCount: raw.yesCount,
        noCount: raw.noCount,
        maybeCount: raw.maybeCount,
        createdAt: raw.createdAt.toNumber(),
        metadataHash: Buffer.from(raw.metadataHash),
      };
    } catch {
      return null;
    }
  }

  async getRsvp(event: PublicKey, attendee: PublicKey): Promise<OnchainRsvp | null> {
    const [pda] = this.deriveRsvp(event, attendee);
    try {
      const raw = (await (this.program.account as any).rsvp.fetch(pda)) as {
        event: PublicKey;
        attendee: PublicKey;
        attendeeTid: BN;
        status: number;
        respondedAt: BN;
      };
      return {
        event: raw.event,
        attendee: raw.attendee,
        attendeeTid: BigInt(raw.attendeeTid.toString()),
        status: raw.status as RsvpStatus,
        respondedAt: raw.respondedAt.toNumber(),
      };
    } catch {
      return null;
    }
  }
}
