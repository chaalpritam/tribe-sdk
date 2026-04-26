export const PROTOCOL_VERSION = 1;

/**
 * Reserved id of the protocol-wide default channel. Every hub seeds a
 * channel with this id; tweets without a user-selected channel land here.
 */
export const GENERAL_CHANNEL_ID = "general";

export enum ChannelKind {
  GENERAL = 1,
  CITY = 2,
  INTEREST = 3,
}

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
  TASK_ADD = 20,
  TASK_CLAIM = 21,
  TASK_COMPLETE = 22,
  CROWDFUND_ADD = 23,
  CROWDFUND_PLEDGE = 24,
  TIP_ADD = 25,
  DM_GROUP_CREATE = 26,
  DM_GROUP_SEND = 27,
  DM_READ = 28,
}

export interface DmReadBody {
  conversationId: string;
  lastReadHash: string;
}

export interface DmGroupCreateBody {
  groupId: string;
  name: string;
  memberTids: string[];
}

export interface DmGroupCipher {
  recipientTid: string;
  ciphertext: string;
  nonce: string;
}

export interface DmGroupSendBody {
  groupId: string;
  senderX25519: string;
  ciphertexts: DmGroupCipher[];
}

export interface TipAddBody {
  recipientTid: bigint;
  amount: number;
  currency?: string;
  /** Optional hash of the tweet/comment being tipped against. */
  targetHash?: string;
  /** Optional Solana tx signature if a real SPL transfer happened. */
  txSignature?: string;
}

export interface CrowdfundAddBody {
  crowdfundId: string;
  title: string;
  description?: string;
  goalAmount: number;
  currency?: string;
  deadlineAtUnix?: number;
  imageUrl?: string;
  channelId?: string;
}

export interface CrowdfundPledgeBody {
  crowdfundId: string;
  amount: number;
  currency?: string;
}

export interface TaskAddBody {
  taskId: string;
  title: string;
  description?: string;
  rewardText?: string;
  channelId?: string;
}

export interface TaskTransitionBody {
  taskId: string;
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
  /**
   * Required at the protocol level. The SDK fills it with
   * GENERAL_CHANNEL_ID when omitted; hubs reject empty values.
   */
  channelId: string;
}

export interface ChannelAddBody {
  channelId: string;
  name: string;
  description?: string;
  kind: ChannelKind;
  /** Only meaningful for CITY channels. */
  latitude?: number;
  longitude?: number;
}

export interface ChannelMembershipBody {
  channelId: string;
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
  | ChannelAddBody
  | ChannelMembershipBody
  | DmKeyRegisterBody
  | DmSendBody
  | BookmarkBody
  | PollAddBody
  | PollVoteBody
  | EventAddBody
  | EventRsvpBody
  | TaskAddBody
  | TaskTransitionBody
  | CrowdfundAddBody
  | CrowdfundPledgeBody
  | TipAddBody
  | DmGroupCreateBody
  | DmGroupSendBody
  | DmReadBody;

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
