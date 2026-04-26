export const PROTOCOL_VERSION = 1;

export enum MessageType {
  TWEET_ADD = 1,
  TWEET_REMOVE = 2,
  REACTION_ADD = 3,
  REACTION_REMOVE = 4,
  LINK_ADD = 5,
  LINK_REMOVE = 6,
  USER_DATA_ADD = 7,
  USERNAME_PROOF = 8,
  CHANNEL_ADD = 9,
  CHANNEL_JOIN = 10,
  CHANNEL_LEAVE = 11,
  DM_KEY_REGISTER = 12,
  DM_SEND = 13,
  BOOKMARK_ADD = 14,
  BOOKMARK_REMOVE = 15,
  POLL_ADD = 16,
  POLL_VOTE = 17,
  EVENT_ADD = 18,
  EVENT_RSVP = 19,
}

export interface EventAddBody {
  eventId: string;
  title: string;
  description?: string;
  startsAt: number;
  endsAt?: number;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  channelId?: string;
  imageUrl?: string;
}

export interface EventRsvpBody {
  eventId: string;
  status: "yes" | "no" | "maybe";
}

export interface BookmarkBody {
  /** Hash of the tweet (or any signed message) being bookmarked. */
  targetHash: string;
}

export interface PollAddBody {
  pollId: string;
  question: string;
  options: string[];
  expiresAt?: number;
  channelId?: string;
}

export interface PollVoteBody {
  pollId: string;
  optionIndex: number;
}

export interface DmKeyRegisterBody {
  /** Base64 x25519 public key the caller can be reached at. */
  x25519Pubkey: string;
}

export interface DmSendBody {
  recipientTid: bigint;
  /** Base64 nacl.box ciphertext. */
  ciphertext: string;
  /** Base64 24-byte nonce. */
  nonce: string;
  /** Base64 sender x25519 public key — needed by the recipient to open. */
  senderX25519: string;
}

export enum ReactionType {
  LIKE = 1,
  RECAST = 2,
}

export enum Network {
  MAINNET = 1,
  DEVNET = 2,
}

export interface TweetAddBody {
  text: string;
  mentions: bigint[];
  embeds: string[];
  parentHash?: Uint8Array;
  channelId?: string;
}

export interface TweetRemoveBody {
  targetHash: Uint8Array;
}

export interface ReactionBody {
  type: ReactionType;
  targetHash: Uint8Array;
}

export interface UserDataBody {
  field: string;
  value: string;
}

export type MessageBody =
  | TweetAddBody
  | TweetRemoveBody
  | ReactionBody
  | UserDataBody
  | DmKeyRegisterBody
  | DmSendBody
  | BookmarkBody
  | PollAddBody
  | PollVoteBody
  | EventAddBody
  | EventRsvpBody;

export interface MessageData {
  type: MessageType;
  tid: bigint;
  timestamp: number;
  network: Network;
  body: MessageBody;
}

export interface TribeMessage {
  protocolVersion: number;
  data: MessageData;
  hash: Uint8Array;
  signature: Uint8Array;
  signer: Uint8Array;
}
