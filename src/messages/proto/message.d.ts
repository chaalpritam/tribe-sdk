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

        /** MessageData fid */
        fid?: (number|Long|null);

        /** MessageData timestamp */
        timestamp?: (number|null);

        /** MessageData network */
        network?: (tribe.Network|null);

        /** MessageData castAdd */
        castAdd?: (tribe.ICastAddBody|null);

        /** MessageData castRemove */
        castRemove?: (tribe.ICastRemoveBody|null);

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

        /** MessageData fid. */
        public fid: (number|Long);

        /** MessageData timestamp. */
        public timestamp: number;

        /** MessageData network. */
        public network: tribe.Network;

        /** MessageData castAdd. */
        public castAdd?: (tribe.ICastAddBody|null);

        /** MessageData castRemove. */
        public castRemove?: (tribe.ICastRemoveBody|null);

        /** MessageData reaction. */
        public reaction?: (tribe.IReactionBody|null);

        /** MessageData userData. */
        public userData?: (tribe.IUserDataBody|null);

        /** MessageData body. */
        public body?: ("castAdd"|"castRemove"|"reaction"|"userData");

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

    /** Properties of a CastAddBody. */
    interface ICastAddBody {

        /** CastAddBody text */
        text?: (string|null);

        /** CastAddBody mentions */
        mentions?: ((number|Long)[]|null);

        /** CastAddBody embeds */
        embeds?: (string[]|null);

        /** CastAddBody parentHash */
        parentHash?: (Uint8Array|null);

        /** CastAddBody channelId */
        channelId?: (string|null);
    }

    /** Represents a CastAddBody. */
    class CastAddBody implements ICastAddBody {

        /**
         * Constructs a new CastAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ICastAddBody);

        /** CastAddBody text. */
        public text: string;

        /** CastAddBody mentions. */
        public mentions: (number|Long)[];

        /** CastAddBody embeds. */
        public embeds: string[];

        /** CastAddBody parentHash. */
        public parentHash: Uint8Array;

        /** CastAddBody channelId. */
        public channelId: string;

        /**
         * Creates a new CastAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CastAddBody instance
         */
        public static create(properties?: tribe.ICastAddBody): tribe.CastAddBody;

        /**
         * Encodes the specified CastAddBody message. Does not implicitly {@link tribe.CastAddBody.verify|verify} messages.
         * @param message CastAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ICastAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CastAddBody message, length delimited. Does not implicitly {@link tribe.CastAddBody.verify|verify} messages.
         * @param message CastAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ICastAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CastAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CastAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.CastAddBody;

        /**
         * Decodes a CastAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CastAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.CastAddBody;

        /**
         * Verifies a CastAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CastAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CastAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.CastAddBody;

        /**
         * Creates a plain object from a CastAddBody message. Also converts values to other types if specified.
         * @param message CastAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.CastAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CastAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CastAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CastRemoveBody. */
    interface ICastRemoveBody {

        /** CastRemoveBody targetHash */
        targetHash?: (Uint8Array|null);
    }

    /** Represents a CastRemoveBody. */
    class CastRemoveBody implements ICastRemoveBody {

        /**
         * Constructs a new CastRemoveBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ICastRemoveBody);

        /** CastRemoveBody targetHash. */
        public targetHash: Uint8Array;

        /**
         * Creates a new CastRemoveBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CastRemoveBody instance
         */
        public static create(properties?: tribe.ICastRemoveBody): tribe.CastRemoveBody;

        /**
         * Encodes the specified CastRemoveBody message. Does not implicitly {@link tribe.CastRemoveBody.verify|verify} messages.
         * @param message CastRemoveBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ICastRemoveBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CastRemoveBody message, length delimited. Does not implicitly {@link tribe.CastRemoveBody.verify|verify} messages.
         * @param message CastRemoveBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ICastRemoveBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CastRemoveBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CastRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.CastRemoveBody;

        /**
         * Decodes a CastRemoveBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CastRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.CastRemoveBody;

        /**
         * Verifies a CastRemoveBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CastRemoveBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CastRemoveBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.CastRemoveBody;

        /**
         * Creates a plain object from a CastRemoveBody message. Also converts values to other types if specified.
         * @param message CastRemoveBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.CastRemoveBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CastRemoveBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CastRemoveBody
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
        CAST_ADD = 1,
        CAST_REMOVE = 2,
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
