import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace tribe. */
export namespace tribe {

    /** Properties of a TribeMessage. */
    interface ITribeMessage {

        /** TribeMessage protocolVersion */
        protocolVersion?: (number|null);

        /** TribeMessage data */
        data?: (tribe.IMessageData|null);

        /** TribeMessage hash */
        hash?: (Uint8Array|null);

        /** TribeMessage signature */
        signature?: (Uint8Array|null);

        /** TribeMessage signer */
        signer?: (Uint8Array|null);
    }

    /** Represents a TribeMessage. */
    class TribeMessage implements ITribeMessage {

        /**
         * Constructs a new TribeMessage.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITribeMessage);

        /** TribeMessage protocolVersion. */
        public protocolVersion: number;

        /** TribeMessage data. */
        public data?: (tribe.IMessageData|null);

        /** TribeMessage hash. */
        public hash: Uint8Array;

        /** TribeMessage signature. */
        public signature: Uint8Array;

        /** TribeMessage signer. */
        public signer: Uint8Array;

        /**
         * Creates a new TribeMessage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TribeMessage instance
         */
        public static create(properties?: tribe.ITribeMessage): tribe.TribeMessage;

        /**
         * Encodes the specified TribeMessage message. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @param message TribeMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITribeMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TribeMessage message, length delimited. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @param message TribeMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITribeMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TribeMessage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TribeMessage;

        /**
         * Decodes a TribeMessage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TribeMessage;

        /**
         * Verifies a TribeMessage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TribeMessage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TribeMessage
         */
        public static fromObject(object: { [k: string]: any }): tribe.TribeMessage;

        /**
         * Creates a plain object from a TribeMessage message. Also converts values to other types if specified.
         * @param message TribeMessage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TribeMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TribeMessage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TribeMessage
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MessageData. */
    interface IMessageData {

        /** MessageData type */
        type?: (tribe.MessageType|null);

        /** MessageData tid */
        tid?: (number|Long|null);

        /** MessageData timestamp */
        timestamp?: (number|null);

        /** MessageData network */
        network?: (tribe.Network|null);

        /** MessageData tweetAdd */
        tweetAdd?: (tribe.ITweetAddBody|null);

        /** MessageData tweetRemove */
        tweetRemove?: (tribe.ITweetRemoveBody|null);

        /** MessageData reaction */
        reaction?: (tribe.IReactionBody|null);

        /** MessageData userData */
        userData?: (tribe.IUserDataBody|null);
    }

    /** Represents a MessageData. */
    class MessageData implements IMessageData {

        /**
         * Constructs a new MessageData.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IMessageData);

        /** MessageData type. */
        public type: tribe.MessageType;

        /** MessageData tid. */
        public tid: (number|Long);

        /** MessageData timestamp. */
        public timestamp: number;

        /** MessageData network. */
        public network: tribe.Network;

        /** MessageData tweetAdd. */
        public tweetAdd?: (tribe.ITweetAddBody|null);

        /** MessageData tweetRemove. */
        public tweetRemove?: (tribe.ITweetRemoveBody|null);

        /** MessageData reaction. */
        public reaction?: (tribe.IReactionBody|null);

        /** MessageData userData. */
        public userData?: (tribe.IUserDataBody|null);

        /** MessageData body. */
        public body?: ("tweetAdd"|"tweetRemove"|"reaction"|"userData");

        /**
         * Creates a new MessageData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageData instance
         */
        public static create(properties?: tribe.IMessageData): tribe.MessageData;

        /**
         * Encodes the specified MessageData message. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @param message MessageData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IMessageData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageData message, length delimited. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @param message MessageData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IMessageData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.MessageData;

        /**
         * Decodes a MessageData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.MessageData;

        /**
         * Verifies a MessageData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageData
         */
        public static fromObject(object: { [k: string]: any }): tribe.MessageData;

        /**
         * Creates a plain object from a MessageData message. Also converts values to other types if specified.
         * @param message MessageData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.MessageData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MessageData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TweetAddBody. */
    interface ITweetAddBody {

        /** TweetAddBody text */
        text?: (string|null);

        /** TweetAddBody mentions */
        mentions?: ((number|Long)[]|null);

        /** TweetAddBody embeds */
        embeds?: (string[]|null);

        /** TweetAddBody parentHash */
        parentHash?: (Uint8Array|null);

        /** TweetAddBody channelId */
        channelId?: (string|null);
    }

    /** Represents a TweetAddBody. */
    class TweetAddBody implements ITweetAddBody {

        /**
         * Constructs a new TweetAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITweetAddBody);

        /** TweetAddBody text. */
        public text: string;

        /** TweetAddBody mentions. */
        public mentions: (number|Long)[];

        /** TweetAddBody embeds. */
        public embeds: string[];

        /** TweetAddBody parentHash. */
        public parentHash: Uint8Array;

        /** TweetAddBody channelId. */
        public channelId: string;

        /**
         * Creates a new TweetAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TweetAddBody instance
         */
        public static create(properties?: tribe.ITweetAddBody): tribe.TweetAddBody;

        /**
         * Encodes the specified TweetAddBody message. Does not implicitly {@link tribe.TweetAddBody.verify|verify} messages.
         * @param message TweetAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITweetAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TweetAddBody message, length delimited. Does not implicitly {@link tribe.TweetAddBody.verify|verify} messages.
         * @param message TweetAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITweetAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TweetAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TweetAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TweetAddBody;

        /**
         * Decodes a TweetAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TweetAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TweetAddBody;

        /**
         * Verifies a TweetAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TweetAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TweetAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TweetAddBody;

        /**
         * Creates a plain object from a TweetAddBody message. Also converts values to other types if specified.
         * @param message TweetAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TweetAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TweetAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TweetAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TweetRemoveBody. */
    interface ITweetRemoveBody {

        /** TweetRemoveBody targetHash */
        targetHash?: (Uint8Array|null);
    }

    /** Represents a TweetRemoveBody. */
    class TweetRemoveBody implements ITweetRemoveBody {

        /**
         * Constructs a new TweetRemoveBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITweetRemoveBody);

        /** TweetRemoveBody targetHash. */
        public targetHash: Uint8Array;

        /**
         * Creates a new TweetRemoveBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TweetRemoveBody instance
         */
        public static create(properties?: tribe.ITweetRemoveBody): tribe.TweetRemoveBody;

        /**
         * Encodes the specified TweetRemoveBody message. Does not implicitly {@link tribe.TweetRemoveBody.verify|verify} messages.
         * @param message TweetRemoveBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITweetRemoveBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TweetRemoveBody message, length delimited. Does not implicitly {@link tribe.TweetRemoveBody.verify|verify} messages.
         * @param message TweetRemoveBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITweetRemoveBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TweetRemoveBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TweetRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TweetRemoveBody;

        /**
         * Decodes a TweetRemoveBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TweetRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TweetRemoveBody;

        /**
         * Verifies a TweetRemoveBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TweetRemoveBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TweetRemoveBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TweetRemoveBody;

        /**
         * Creates a plain object from a TweetRemoveBody message. Also converts values to other types if specified.
         * @param message TweetRemoveBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TweetRemoveBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TweetRemoveBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TweetRemoveBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ReactionBody. */
    interface IReactionBody {

        /** ReactionBody type */
        type?: (tribe.ReactionType|null);

        /** ReactionBody targetHash */
        targetHash?: (Uint8Array|null);
    }

    /** Represents a ReactionBody. */
    class ReactionBody implements IReactionBody {

        /**
         * Constructs a new ReactionBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IReactionBody);

        /** ReactionBody type. */
        public type: tribe.ReactionType;

        /** ReactionBody targetHash. */
        public targetHash: Uint8Array;

        /**
         * Creates a new ReactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ReactionBody instance
         */
        public static create(properties?: tribe.IReactionBody): tribe.ReactionBody;

        /**
         * Encodes the specified ReactionBody message. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @param message ReactionBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IReactionBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ReactionBody message, length delimited. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @param message ReactionBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IReactionBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ReactionBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.ReactionBody;

        /**
         * Decodes a ReactionBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.ReactionBody;

        /**
         * Verifies a ReactionBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ReactionBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ReactionBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.ReactionBody;

        /**
         * Creates a plain object from a ReactionBody message. Also converts values to other types if specified.
         * @param message ReactionBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.ReactionBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ReactionBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ReactionBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a UserDataBody. */
    interface IUserDataBody {

        /** UserDataBody field */
        field?: (string|null);

        /** UserDataBody value */
        value?: (string|null);
    }

    /** Represents a UserDataBody. */
    class UserDataBody implements IUserDataBody {

        /**
         * Constructs a new UserDataBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IUserDataBody);

        /** UserDataBody field. */
        public field: string;

        /** UserDataBody value. */
        public value: string;

        /**
         * Creates a new UserDataBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserDataBody instance
         */
        public static create(properties?: tribe.IUserDataBody): tribe.UserDataBody;

        /**
         * Encodes the specified UserDataBody message. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @param message UserDataBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IUserDataBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UserDataBody message, length delimited. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @param message UserDataBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IUserDataBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserDataBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.UserDataBody;

        /**
         * Decodes a UserDataBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.UserDataBody;

        /**
         * Verifies a UserDataBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserDataBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserDataBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.UserDataBody;

        /**
         * Creates a plain object from a UserDataBody message. Also converts values to other types if specified.
         * @param message UserDataBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.UserDataBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserDataBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UserDataBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** MessageType enum. */
    enum MessageType {
        MESSAGE_TYPE_NONE = 0,
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
        CHANNEL_LEAVE = 11
    }

    /** ReactionType enum. */
    enum ReactionType {
        REACTION_TYPE_NONE = 0,
        LIKE = 1,
        RECAST = 2
    }

    /** Network enum. */
    enum Network {
        NETWORK_NONE = 0,
        MAINNET = 1,
        DEVNET = 2
    }
}
