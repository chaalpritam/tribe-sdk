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

export type MessageBody = TweetAddBody | TweetRemoveBody | ReactionBody | UserDataBody;

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
