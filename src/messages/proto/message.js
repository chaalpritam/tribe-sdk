/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.tribe = (function() {

    /**
     * Namespace tribe.
     * @exports tribe
     * @namespace
     */
    var tribe = {};

    tribe.TribeMessage = (function() {

        /**
         * Properties of a TribeMessage.
         * @memberof tribe
         * @interface ITribeMessage
         * @property {number|null} [protocolVersion] TribeMessage protocolVersion
         * @property {tribe.IMessageData|null} [data] TribeMessage data
         * @property {Uint8Array|null} [hash] TribeMessage hash
         * @property {Uint8Array|null} [signature] TribeMessage signature
         * @property {Uint8Array|null} [signer] TribeMessage signer
         */

        /**
         * Constructs a new TribeMessage.
         * @memberof tribe
         * @classdesc Represents a TribeMessage.
         * @implements ITribeMessage
         * @constructor
         * @param {tribe.ITribeMessage=} [properties] Properties to set
         */
        function TribeMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TribeMessage protocolVersion.
         * @member {number} protocolVersion
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.protocolVersion = 0;

        /**
         * TribeMessage data.
         * @member {tribe.IMessageData|null|undefined} data
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.data = null;

        /**
         * TribeMessage hash.
         * @member {Uint8Array} hash
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.hash = $util.newBuffer([]);

        /**
         * TribeMessage signature.
         * @member {Uint8Array} signature
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.signature = $util.newBuffer([]);

        /**
         * TribeMessage signer.
         * @member {Uint8Array} signer
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.signer = $util.newBuffer([]);

        /**
         * Creates a new TribeMessage instance using the specified properties.
         * @function create
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.ITribeMessage=} [properties] Properties to set
         * @returns {tribe.TribeMessage} TribeMessage instance
         */
        TribeMessage.create = function create(properties) {
            return new TribeMessage(properties);
        };

        /**
         * Encodes the specified TribeMessage message. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @function encode
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.ITribeMessage} message TribeMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TribeMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.protocolVersion != null && Object.hasOwnProperty.call(message, "protocolVersion"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.protocolVersion);
            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                $root.tribe.MessageData.encode(message.data, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.hash != null && Object.hasOwnProperty.call(message, "hash"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.hash);
            if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.signature);
            if (message.signer != null && Object.hasOwnProperty.call(message, "signer"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.signer);
            return writer;
        };

        /**
         * Encodes the specified TribeMessage message, length delimited. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.ITribeMessage} message TribeMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TribeMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TribeMessage message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TribeMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TribeMessage} TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TribeMessage.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TribeMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.protocolVersion = reader.uint32();
                        break;
                    }
                case 2: {
                        message.data = $root.tribe.MessageData.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.hash = reader.bytes();
                        break;
                    }
                case 4: {
                        message.signature = reader.bytes();
                        break;
                    }
                case 5: {
                        message.signer = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TribeMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TribeMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TribeMessage} TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TribeMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TribeMessage message.
         * @function verify
         * @memberof tribe.TribeMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TribeMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.protocolVersion != null && message.hasOwnProperty("protocolVersion"))
                if (!$util.isInteger(message.protocolVersion))
                    return "protocolVersion: integer expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                var error = $root.tribe.MessageData.verify(message.data);
                if (error)
                    return "data." + error;
            }
            if (message.hash != null && message.hasOwnProperty("hash"))
                if (!(message.hash && typeof message.hash.length === "number" || $util.isString(message.hash)))
                    return "hash: buffer expected";
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                    return "signature: buffer expected";
            if (message.signer != null && message.hasOwnProperty("signer"))
                if (!(message.signer && typeof message.signer.length === "number" || $util.isString(message.signer)))
                    return "signer: buffer expected";
            return null;
        };

        /**
         * Creates a TribeMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TribeMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TribeMessage} TribeMessage
         */
        TribeMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TribeMessage)
                return object;
            var message = new $root.tribe.TribeMessage();
            if (object.protocolVersion != null)
                message.protocolVersion = object.protocolVersion >>> 0;
            if (object.data != null) {
                if (typeof object.data !== "object")
                    throw TypeError(".tribe.TribeMessage.data: object expected");
                message.data = $root.tribe.MessageData.fromObject(object.data);
            }
            if (object.hash != null)
                if (typeof object.hash === "string")
                    $util.base64.decode(object.hash, message.hash = $util.newBuffer($util.base64.length(object.hash)), 0);
                else if (object.hash.length >= 0)
                    message.hash = object.hash;
            if (object.signature != null)
                if (typeof object.signature === "string")
                    $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                else if (object.signature.length >= 0)
                    message.signature = object.signature;
            if (object.signer != null)
                if (typeof object.signer === "string")
                    $util.base64.decode(object.signer, message.signer = $util.newBuffer($util.base64.length(object.signer)), 0);
                else if (object.signer.length >= 0)
                    message.signer = object.signer;
            return message;
        };

        /**
         * Creates a plain object from a TribeMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.TribeMessage} message TribeMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TribeMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.protocolVersion = 0;
                object.data = null;
                if (options.bytes === String)
                    object.hash = "";
                else {
                    object.hash = [];
                    if (options.bytes !== Array)
                        object.hash = $util.newBuffer(object.hash);
                }
                if (options.bytes === String)
                    object.signature = "";
                else {
                    object.signature = [];
                    if (options.bytes !== Array)
                        object.signature = $util.newBuffer(object.signature);
                }
                if (options.bytes === String)
                    object.signer = "";
                else {
                    object.signer = [];
                    if (options.bytes !== Array)
                        object.signer = $util.newBuffer(object.signer);
                }
            }
            if (message.protocolVersion != null && message.hasOwnProperty("protocolVersion"))
                object.protocolVersion = message.protocolVersion;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = $root.tribe.MessageData.toObject(message.data, options);
            if (message.hash != null && message.hasOwnProperty("hash"))
                object.hash = options.bytes === String ? $util.base64.encode(message.hash, 0, message.hash.length) : options.bytes === Array ? Array.prototype.slice.call(message.hash) : message.hash;
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
            if (message.signer != null && message.hasOwnProperty("signer"))
                object.signer = options.bytes === String ? $util.base64.encode(message.signer, 0, message.signer.length) : options.bytes === Array ? Array.prototype.slice.call(message.signer) : message.signer;
            return object;
        };

        /**
         * Converts this TribeMessage to JSON.
         * @function toJSON
         * @memberof tribe.TribeMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TribeMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TribeMessage
         * @function getTypeUrl
         * @memberof tribe.TribeMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TribeMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TribeMessage";
        };

        return TribeMessage;
    })();

    tribe.MessageData = (function() {

        /**
         * Properties of a MessageData.
         * @memberof tribe
         * @interface IMessageData
         * @property {tribe.MessageType|null} [type] MessageData type
         * @property {number|Long|null} [fid] MessageData fid
         * @property {number|null} [timestamp] MessageData timestamp
         * @property {tribe.Network|null} [network] MessageData network
         * @property {tribe.ICastAddBody|null} [castAdd] MessageData castAdd
         * @property {tribe.ICastRemoveBody|null} [castRemove] MessageData castRemove
         * @property {tribe.IReactionBody|null} [reaction] MessageData reaction
         * @property {tribe.IUserDataBody|null} [userData] MessageData userData
         */

        /**
         * Constructs a new MessageData.
         * @memberof tribe
         * @classdesc Represents a MessageData.
         * @implements IMessageData
         * @constructor
         * @param {tribe.IMessageData=} [properties] Properties to set
         */
        function MessageData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageData type.
         * @member {tribe.MessageType} type
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.type = 0;

        /**
         * MessageData fid.
         * @member {number|Long} fid
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.fid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MessageData timestamp.
         * @member {number} timestamp
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.timestamp = 0;

        /**
         * MessageData network.
         * @member {tribe.Network} network
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.network = 0;

        /**
         * MessageData castAdd.
         * @member {tribe.ICastAddBody|null|undefined} castAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.castAdd = null;

        /**
         * MessageData castRemove.
         * @member {tribe.ICastRemoveBody|null|undefined} castRemove
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.castRemove = null;

        /**
         * MessageData reaction.
         * @member {tribe.IReactionBody|null|undefined} reaction
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.reaction = null;

        /**
         * MessageData userData.
         * @member {tribe.IUserDataBody|null|undefined} userData
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.userData = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * MessageData body.
         * @member {"castAdd"|"castRemove"|"reaction"|"userData"|undefined} body
         * @memberof tribe.MessageData
         * @instance
         */
        Object.defineProperty(MessageData.prototype, "body", {
            get: $util.oneOfGetter($oneOfFields = ["castAdd", "castRemove", "reaction", "userData"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MessageData instance using the specified properties.
         * @function create
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.IMessageData=} [properties] Properties to set
         * @returns {tribe.MessageData} MessageData instance
         */
        MessageData.create = function create(properties) {
            return new MessageData(properties);
        };

        /**
         * Encodes the specified MessageData message. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @function encode
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.IMessageData} message MessageData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.fid != null && Object.hasOwnProperty.call(message, "fid"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.fid);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.timestamp);
            if (message.network != null && Object.hasOwnProperty.call(message, "network"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.network);
            if (message.castAdd != null && Object.hasOwnProperty.call(message, "castAdd"))
                $root.tribe.CastAddBody.encode(message.castAdd, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.castRemove != null && Object.hasOwnProperty.call(message, "castRemove"))
                $root.tribe.CastRemoveBody.encode(message.castRemove, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.reaction != null && Object.hasOwnProperty.call(message, "reaction"))
                $root.tribe.ReactionBody.encode(message.reaction, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.userData != null && Object.hasOwnProperty.call(message, "userData"))
                $root.tribe.UserDataBody.encode(message.userData, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MessageData message, length delimited. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.IMessageData} message MessageData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageData message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.MessageData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.MessageData} MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageData.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.MessageData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.int32();
                        break;
                    }
                case 2: {
                        message.fid = reader.uint64();
                        break;
                    }
                case 3: {
                        message.timestamp = reader.uint32();
                        break;
                    }
                case 4: {
                        message.network = reader.int32();
                        break;
                    }
                case 5: {
                        message.castAdd = $root.tribe.CastAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.castRemove = $root.tribe.CastRemoveBody.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.reaction = $root.tribe.ReactionBody.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.userData = $root.tribe.UserDataBody.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.MessageData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.MessageData} MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageData message.
         * @function verify
         * @memberof tribe.MessageData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                    break;
                }
            if (message.fid != null && message.hasOwnProperty("fid"))
                if (!$util.isInteger(message.fid) && !(message.fid && $util.isInteger(message.fid.low) && $util.isInteger(message.fid.high)))
                    return "fid: integer|Long expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp))
                    return "timestamp: integer expected";
            if (message.network != null && message.hasOwnProperty("network"))
                switch (message.network) {
                default:
                    return "network: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.castAdd != null && message.hasOwnProperty("castAdd")) {
                properties.body = 1;
                {
                    var error = $root.tribe.CastAddBody.verify(message.castAdd);
                    if (error)
                        return "castAdd." + error;
                }
            }
            if (message.castRemove != null && message.hasOwnProperty("castRemove")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.CastRemoveBody.verify(message.castRemove);
                    if (error)
                        return "castRemove." + error;
                }
            }
            if (message.reaction != null && message.hasOwnProperty("reaction")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.ReactionBody.verify(message.reaction);
                    if (error)
                        return "reaction." + error;
                }
            }
            if (message.userData != null && message.hasOwnProperty("userData")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.UserDataBody.verify(message.userData);
                    if (error)
                        return "userData." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MessageData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.MessageData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.MessageData} MessageData
         */
        MessageData.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.MessageData)
                return object;
            var message = new $root.tribe.MessageData();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "MESSAGE_TYPE_NONE":
            case 0:
                message.type = 0;
                break;
            case "CAST_ADD":
            case 1:
                message.type = 1;
                break;
            case "CAST_REMOVE":
            case 2:
                message.type = 2;
                break;
            case "REACTION_ADD":
            case 3:
                message.type = 3;
                break;
            case "REACTION_REMOVE":
            case 4:
                message.type = 4;
                break;
            case "LINK_ADD":
            case 5:
                message.type = 5;
                break;
            case "LINK_REMOVE":
            case 6:
                message.type = 6;
                break;
            case "USER_DATA_ADD":
            case 7:
                message.type = 7;
                break;
            case "USERNAME_PROOF":
            case 8:
                message.type = 8;
                break;
            case "CHANNEL_ADD":
            case 9:
                message.type = 9;
                break;
            case "CHANNEL_JOIN":
            case 10:
                message.type = 10;
                break;
            case "CHANNEL_LEAVE":
            case 11:
                message.type = 11;
                break;
            }
            if (object.fid != null)
                if ($util.Long)
                    (message.fid = $util.Long.fromValue(object.fid)).unsigned = true;
                else if (typeof object.fid === "string")
                    message.fid = parseInt(object.fid, 10);
                else if (typeof object.fid === "number")
                    message.fid = object.fid;
                else if (typeof object.fid === "object")
                    message.fid = new $util.LongBits(object.fid.low >>> 0, object.fid.high >>> 0).toNumber(true);
            if (object.timestamp != null)
                message.timestamp = object.timestamp >>> 0;
            switch (object.network) {
            default:
                if (typeof object.network === "number") {
                    message.network = object.network;
                    break;
                }
                break;
            case "NETWORK_NONE":
            case 0:
                message.network = 0;
                break;
            case "MAINNET":
            case 1:
                message.network = 1;
                break;
            case "DEVNET":
            case 2:
                message.network = 2;
                break;
            }
            if (object.castAdd != null) {
                if (typeof object.castAdd !== "object")
                    throw TypeError(".tribe.MessageData.castAdd: object expected");
                message.castAdd = $root.tribe.CastAddBody.fromObject(object.castAdd);
            }
            if (object.castRemove != null) {
                if (typeof object.castRemove !== "object")
                    throw TypeError(".tribe.MessageData.castRemove: object expected");
                message.castRemove = $root.tribe.CastRemoveBody.fromObject(object.castRemove);
            }
            if (object.reaction != null) {
                if (typeof object.reaction !== "object")
                    throw TypeError(".tribe.MessageData.reaction: object expected");
                message.reaction = $root.tribe.ReactionBody.fromObject(object.reaction);
            }
            if (object.userData != null) {
                if (typeof object.userData !== "object")
                    throw TypeError(".tribe.MessageData.userData: object expected");
                message.userData = $root.tribe.UserDataBody.fromObject(object.userData);
            }
            return message;
        };

        /**
         * Creates a plain object from a MessageData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.MessageData} message MessageData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = options.enums === String ? "MESSAGE_TYPE_NONE" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.fid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fid = options.longs === String ? "0" : 0;
                object.timestamp = 0;
                object.network = options.enums === String ? "NETWORK_NONE" : 0;
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.tribe.MessageType[message.type] === undefined ? message.type : $root.tribe.MessageType[message.type] : message.type;
            if (message.fid != null && message.hasOwnProperty("fid"))
                if (typeof message.fid === "number")
                    object.fid = options.longs === String ? String(message.fid) : message.fid;
                else
                    object.fid = options.longs === String ? $util.Long.prototype.toString.call(message.fid) : options.longs === Number ? new $util.LongBits(message.fid.low >>> 0, message.fid.high >>> 0).toNumber(true) : message.fid;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                object.timestamp = message.timestamp;
            if (message.network != null && message.hasOwnProperty("network"))
                object.network = options.enums === String ? $root.tribe.Network[message.network] === undefined ? message.network : $root.tribe.Network[message.network] : message.network;
            if (message.castAdd != null && message.hasOwnProperty("castAdd")) {
                object.castAdd = $root.tribe.CastAddBody.toObject(message.castAdd, options);
                if (options.oneofs)
                    object.body = "castAdd";
            }
            if (message.castRemove != null && message.hasOwnProperty("castRemove")) {
                object.castRemove = $root.tribe.CastRemoveBody.toObject(message.castRemove, options);
                if (options.oneofs)
                    object.body = "castRemove";
            }
            if (message.reaction != null && message.hasOwnProperty("reaction")) {
                object.reaction = $root.tribe.ReactionBody.toObject(message.reaction, options);
                if (options.oneofs)
                    object.body = "reaction";
            }
            if (message.userData != null && message.hasOwnProperty("userData")) {
                object.userData = $root.tribe.UserDataBody.toObject(message.userData, options);
                if (options.oneofs)
                    object.body = "userData";
            }
            return object;
        };

        /**
         * Converts this MessageData to JSON.
         * @function toJSON
         * @memberof tribe.MessageData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageData
         * @function getTypeUrl
         * @memberof tribe.MessageData
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.MessageData";
        };

        return MessageData;
    })();

    tribe.CastAddBody = (function() {

        /**
         * Properties of a CastAddBody.
         * @memberof tribe
         * @interface ICastAddBody
         * @property {string|null} [text] CastAddBody text
         * @property {Array.<number|Long>|null} [mentions] CastAddBody mentions
         * @property {Array.<string>|null} [embeds] CastAddBody embeds
         * @property {Uint8Array|null} [parentHash] CastAddBody parentHash
         * @property {string|null} [channelId] CastAddBody channelId
         */

        /**
         * Constructs a new CastAddBody.
         * @memberof tribe
         * @classdesc Represents a CastAddBody.
         * @implements ICastAddBody
         * @constructor
         * @param {tribe.ICastAddBody=} [properties] Properties to set
         */
        function CastAddBody(properties) {
            this.mentions = [];
            this.embeds = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CastAddBody text.
         * @member {string} text
         * @memberof tribe.CastAddBody
         * @instance
         */
        CastAddBody.prototype.text = "";

        /**
         * CastAddBody mentions.
         * @member {Array.<number|Long>} mentions
         * @memberof tribe.CastAddBody
         * @instance
         */
        CastAddBody.prototype.mentions = $util.emptyArray;

        /**
         * CastAddBody embeds.
         * @member {Array.<string>} embeds
         * @memberof tribe.CastAddBody
         * @instance
         */
        CastAddBody.prototype.embeds = $util.emptyArray;

        /**
         * CastAddBody parentHash.
         * @member {Uint8Array} parentHash
         * @memberof tribe.CastAddBody
         * @instance
         */
        CastAddBody.prototype.parentHash = $util.newBuffer([]);

        /**
         * CastAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.CastAddBody
         * @instance
         */
        CastAddBody.prototype.channelId = "";

        /**
         * Creates a new CastAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.CastAddBody
         * @static
         * @param {tribe.ICastAddBody=} [properties] Properties to set
         * @returns {tribe.CastAddBody} CastAddBody instance
         */
        CastAddBody.create = function create(properties) {
            return new CastAddBody(properties);
        };

        /**
         * Encodes the specified CastAddBody message. Does not implicitly {@link tribe.CastAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.CastAddBody
         * @static
         * @param {tribe.ICastAddBody} message CastAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CastAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
            if (message.mentions != null && message.mentions.length) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork();
                for (var i = 0; i < message.mentions.length; ++i)
                    writer.uint64(message.mentions[i]);
                writer.ldelim();
            }
            if (message.embeds != null && message.embeds.length)
                for (var i = 0; i < message.embeds.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.embeds[i]);
            if (message.parentHash != null && Object.hasOwnProperty.call(message, "parentHash"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.parentHash);
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.channelId);
            return writer;
        };

        /**
         * Encodes the specified CastAddBody message, length delimited. Does not implicitly {@link tribe.CastAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.CastAddBody
         * @static
         * @param {tribe.ICastAddBody} message CastAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CastAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CastAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.CastAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.CastAddBody} CastAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CastAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.CastAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.text = reader.string();
                        break;
                    }
                case 2: {
                        if (!(message.mentions && message.mentions.length))
                            message.mentions = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.mentions.push(reader.uint64());
                        } else
                            message.mentions.push(reader.uint64());
                        break;
                    }
                case 3: {
                        if (!(message.embeds && message.embeds.length))
                            message.embeds = [];
                        message.embeds.push(reader.string());
                        break;
                    }
                case 4: {
                        message.parentHash = reader.bytes();
                        break;
                    }
                case 5: {
                        message.channelId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CastAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.CastAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.CastAddBody} CastAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CastAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CastAddBody message.
         * @function verify
         * @memberof tribe.CastAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CastAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            if (message.mentions != null && message.hasOwnProperty("mentions")) {
                if (!Array.isArray(message.mentions))
                    return "mentions: array expected";
                for (var i = 0; i < message.mentions.length; ++i)
                    if (!$util.isInteger(message.mentions[i]) && !(message.mentions[i] && $util.isInteger(message.mentions[i].low) && $util.isInteger(message.mentions[i].high)))
                        return "mentions: integer|Long[] expected";
            }
            if (message.embeds != null && message.hasOwnProperty("embeds")) {
                if (!Array.isArray(message.embeds))
                    return "embeds: array expected";
                for (var i = 0; i < message.embeds.length; ++i)
                    if (!$util.isString(message.embeds[i]))
                        return "embeds: string[] expected";
            }
            if (message.parentHash != null && message.hasOwnProperty("parentHash"))
                if (!(message.parentHash && typeof message.parentHash.length === "number" || $util.isString(message.parentHash)))
                    return "parentHash: buffer expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            return null;
        };

        /**
         * Creates a CastAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.CastAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.CastAddBody} CastAddBody
         */
        CastAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.CastAddBody)
                return object;
            var message = new $root.tribe.CastAddBody();
            if (object.text != null)
                message.text = String(object.text);
            if (object.mentions) {
                if (!Array.isArray(object.mentions))
                    throw TypeError(".tribe.CastAddBody.mentions: array expected");
                message.mentions = [];
                for (var i = 0; i < object.mentions.length; ++i)
                    if ($util.Long)
                        (message.mentions[i] = $util.Long.fromValue(object.mentions[i])).unsigned = true;
                    else if (typeof object.mentions[i] === "string")
                        message.mentions[i] = parseInt(object.mentions[i], 10);
                    else if (typeof object.mentions[i] === "number")
                        message.mentions[i] = object.mentions[i];
                    else if (typeof object.mentions[i] === "object")
                        message.mentions[i] = new $util.LongBits(object.mentions[i].low >>> 0, object.mentions[i].high >>> 0).toNumber(true);
            }
            if (object.embeds) {
                if (!Array.isArray(object.embeds))
                    throw TypeError(".tribe.CastAddBody.embeds: array expected");
                message.embeds = [];
                for (var i = 0; i < object.embeds.length; ++i)
                    message.embeds[i] = String(object.embeds[i]);
            }
            if (object.parentHash != null)
                if (typeof object.parentHash === "string")
                    $util.base64.decode(object.parentHash, message.parentHash = $util.newBuffer($util.base64.length(object.parentHash)), 0);
                else if (object.parentHash.length >= 0)
                    message.parentHash = object.parentHash;
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            return message;
        };

        /**
         * Creates a plain object from a CastAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.CastAddBody
         * @static
         * @param {tribe.CastAddBody} message CastAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CastAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.mentions = [];
                object.embeds = [];
            }
            if (options.defaults) {
                object.text = "";
                if (options.bytes === String)
                    object.parentHash = "";
                else {
                    object.parentHash = [];
                    if (options.bytes !== Array)
                        object.parentHash = $util.newBuffer(object.parentHash);
                }
                object.channelId = "";
            }
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            if (message.mentions && message.mentions.length) {
                object.mentions = [];
                for (var j = 0; j < message.mentions.length; ++j)
                    if (typeof message.mentions[j] === "number")
                        object.mentions[j] = options.longs === String ? String(message.mentions[j]) : message.mentions[j];
                    else
                        object.mentions[j] = options.longs === String ? $util.Long.prototype.toString.call(message.mentions[j]) : options.longs === Number ? new $util.LongBits(message.mentions[j].low >>> 0, message.mentions[j].high >>> 0).toNumber(true) : message.mentions[j];
            }
            if (message.embeds && message.embeds.length) {
                object.embeds = [];
                for (var j = 0; j < message.embeds.length; ++j)
                    object.embeds[j] = message.embeds[j];
            }
            if (message.parentHash != null && message.hasOwnProperty("parentHash"))
                object.parentHash = options.bytes === String ? $util.base64.encode(message.parentHash, 0, message.parentHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.parentHash) : message.parentHash;
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            return object;
        };

        /**
         * Converts this CastAddBody to JSON.
         * @function toJSON
         * @memberof tribe.CastAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CastAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CastAddBody
         * @function getTypeUrl
         * @memberof tribe.CastAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CastAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.CastAddBody";
        };

        return CastAddBody;
    })();

    tribe.CastRemoveBody = (function() {

        /**
         * Properties of a CastRemoveBody.
         * @memberof tribe
         * @interface ICastRemoveBody
         * @property {Uint8Array|null} [targetHash] CastRemoveBody targetHash
         */

        /**
         * Constructs a new CastRemoveBody.
         * @memberof tribe
         * @classdesc Represents a CastRemoveBody.
         * @implements ICastRemoveBody
         * @constructor
         * @param {tribe.ICastRemoveBody=} [properties] Properties to set
         */
        function CastRemoveBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CastRemoveBody targetHash.
         * @member {Uint8Array} targetHash
         * @memberof tribe.CastRemoveBody
         * @instance
         */
        CastRemoveBody.prototype.targetHash = $util.newBuffer([]);

        /**
         * Creates a new CastRemoveBody instance using the specified properties.
         * @function create
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {tribe.ICastRemoveBody=} [properties] Properties to set
         * @returns {tribe.CastRemoveBody} CastRemoveBody instance
         */
        CastRemoveBody.create = function create(properties) {
            return new CastRemoveBody(properties);
        };

        /**
         * Encodes the specified CastRemoveBody message. Does not implicitly {@link tribe.CastRemoveBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {tribe.ICastRemoveBody} message CastRemoveBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CastRemoveBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.targetHash != null && Object.hasOwnProperty.call(message, "targetHash"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.targetHash);
            return writer;
        };

        /**
         * Encodes the specified CastRemoveBody message, length delimited. Does not implicitly {@link tribe.CastRemoveBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {tribe.ICastRemoveBody} message CastRemoveBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CastRemoveBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CastRemoveBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.CastRemoveBody} CastRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CastRemoveBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.CastRemoveBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.targetHash = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CastRemoveBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.CastRemoveBody} CastRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CastRemoveBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CastRemoveBody message.
         * @function verify
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CastRemoveBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                if (!(message.targetHash && typeof message.targetHash.length === "number" || $util.isString(message.targetHash)))
                    return "targetHash: buffer expected";
            return null;
        };

        /**
         * Creates a CastRemoveBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.CastRemoveBody} CastRemoveBody
         */
        CastRemoveBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.CastRemoveBody)
                return object;
            var message = new $root.tribe.CastRemoveBody();
            if (object.targetHash != null)
                if (typeof object.targetHash === "string")
                    $util.base64.decode(object.targetHash, message.targetHash = $util.newBuffer($util.base64.length(object.targetHash)), 0);
                else if (object.targetHash.length >= 0)
                    message.targetHash = object.targetHash;
            return message;
        };

        /**
         * Creates a plain object from a CastRemoveBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {tribe.CastRemoveBody} message CastRemoveBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CastRemoveBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.targetHash = "";
                else {
                    object.targetHash = [];
                    if (options.bytes !== Array)
                        object.targetHash = $util.newBuffer(object.targetHash);
                }
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                object.targetHash = options.bytes === String ? $util.base64.encode(message.targetHash, 0, message.targetHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetHash) : message.targetHash;
            return object;
        };

        /**
         * Converts this CastRemoveBody to JSON.
         * @function toJSON
         * @memberof tribe.CastRemoveBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CastRemoveBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CastRemoveBody
         * @function getTypeUrl
         * @memberof tribe.CastRemoveBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CastRemoveBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.CastRemoveBody";
        };

        return CastRemoveBody;
    })();

    tribe.ReactionBody = (function() {

        /**
         * Properties of a ReactionBody.
         * @memberof tribe
         * @interface IReactionBody
         * @property {tribe.ReactionType|null} [type] ReactionBody type
         * @property {Uint8Array|null} [targetHash] ReactionBody targetHash
         */

        /**
         * Constructs a new ReactionBody.
         * @memberof tribe
         * @classdesc Represents a ReactionBody.
         * @implements IReactionBody
         * @constructor
         * @param {tribe.IReactionBody=} [properties] Properties to set
         */
        function ReactionBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ReactionBody type.
         * @member {tribe.ReactionType} type
         * @memberof tribe.ReactionBody
         * @instance
         */
        ReactionBody.prototype.type = 0;

        /**
         * ReactionBody targetHash.
         * @member {Uint8Array} targetHash
         * @memberof tribe.ReactionBody
         * @instance
         */
        ReactionBody.prototype.targetHash = $util.newBuffer([]);

        /**
         * Creates a new ReactionBody instance using the specified properties.
         * @function create
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.IReactionBody=} [properties] Properties to set
         * @returns {tribe.ReactionBody} ReactionBody instance
         */
        ReactionBody.create = function create(properties) {
            return new ReactionBody(properties);
        };

        /**
         * Encodes the specified ReactionBody message. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.IReactionBody} message ReactionBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReactionBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.targetHash != null && Object.hasOwnProperty.call(message, "targetHash"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.targetHash);
            return writer;
        };

        /**
         * Encodes the specified ReactionBody message, length delimited. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.IReactionBody} message ReactionBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReactionBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ReactionBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.ReactionBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.ReactionBody} ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReactionBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.ReactionBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.int32();
                        break;
                    }
                case 2: {
                        message.targetHash = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ReactionBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.ReactionBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.ReactionBody} ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReactionBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ReactionBody message.
         * @function verify
         * @memberof tribe.ReactionBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ReactionBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                if (!(message.targetHash && typeof message.targetHash.length === "number" || $util.isString(message.targetHash)))
                    return "targetHash: buffer expected";
            return null;
        };

        /**
         * Creates a ReactionBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.ReactionBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.ReactionBody} ReactionBody
         */
        ReactionBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.ReactionBody)
                return object;
            var message = new $root.tribe.ReactionBody();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "REACTION_TYPE_NONE":
            case 0:
                message.type = 0;
                break;
            case "LIKE":
            case 1:
                message.type = 1;
                break;
            case "RECAST":
            case 2:
                message.type = 2;
                break;
            }
            if (object.targetHash != null)
                if (typeof object.targetHash === "string")
                    $util.base64.decode(object.targetHash, message.targetHash = $util.newBuffer($util.base64.length(object.targetHash)), 0);
                else if (object.targetHash.length >= 0)
                    message.targetHash = object.targetHash;
            return message;
        };

        /**
         * Creates a plain object from a ReactionBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.ReactionBody} message ReactionBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ReactionBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = options.enums === String ? "REACTION_TYPE_NONE" : 0;
                if (options.bytes === String)
                    object.targetHash = "";
                else {
                    object.targetHash = [];
                    if (options.bytes !== Array)
                        object.targetHash = $util.newBuffer(object.targetHash);
                }
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.tribe.ReactionType[message.type] === undefined ? message.type : $root.tribe.ReactionType[message.type] : message.type;
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                object.targetHash = options.bytes === String ? $util.base64.encode(message.targetHash, 0, message.targetHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetHash) : message.targetHash;
            return object;
        };

        /**
         * Converts this ReactionBody to JSON.
         * @function toJSON
         * @memberof tribe.ReactionBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ReactionBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ReactionBody
         * @function getTypeUrl
         * @memberof tribe.ReactionBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ReactionBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.ReactionBody";
        };

        return ReactionBody;
    })();

    tribe.UserDataBody = (function() {

        /**
         * Properties of a UserDataBody.
         * @memberof tribe
         * @interface IUserDataBody
         * @property {string|null} [field] UserDataBody field
         * @property {string|null} [value] UserDataBody value
         */

        /**
         * Constructs a new UserDataBody.
         * @memberof tribe
         * @classdesc Represents a UserDataBody.
         * @implements IUserDataBody
         * @constructor
         * @param {tribe.IUserDataBody=} [properties] Properties to set
         */
        function UserDataBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UserDataBody field.
         * @member {string} field
         * @memberof tribe.UserDataBody
         * @instance
         */
        UserDataBody.prototype.field = "";

        /**
         * UserDataBody value.
         * @member {string} value
         * @memberof tribe.UserDataBody
         * @instance
         */
        UserDataBody.prototype.value = "";

        /**
         * Creates a new UserDataBody instance using the specified properties.
         * @function create
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.IUserDataBody=} [properties] Properties to set
         * @returns {tribe.UserDataBody} UserDataBody instance
         */
        UserDataBody.create = function create(properties) {
            return new UserDataBody(properties);
        };

        /**
         * Encodes the specified UserDataBody message. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.IUserDataBody} message UserDataBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserDataBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.field != null && Object.hasOwnProperty.call(message, "field"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.field);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified UserDataBody message, length delimited. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.IUserDataBody} message UserDataBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserDataBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UserDataBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.UserDataBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.UserDataBody} UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserDataBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.UserDataBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.field = reader.string();
                        break;
                    }
                case 2: {
                        message.value = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a UserDataBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.UserDataBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.UserDataBody} UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserDataBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UserDataBody message.
         * @function verify
         * @memberof tribe.UserDataBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UserDataBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.field != null && message.hasOwnProperty("field"))
                if (!$util.isString(message.field))
                    return "field: string expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a UserDataBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.UserDataBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.UserDataBody} UserDataBody
         */
        UserDataBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.UserDataBody)
                return object;
            var message = new $root.tribe.UserDataBody();
            if (object.field != null)
                message.field = String(object.field);
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a UserDataBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.UserDataBody} message UserDataBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UserDataBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.field = "";
                object.value = "";
            }
            if (message.field != null && message.hasOwnProperty("field"))
                object.field = message.field;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this UserDataBody to JSON.
         * @function toJSON
         * @memberof tribe.UserDataBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UserDataBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UserDataBody
         * @function getTypeUrl
         * @memberof tribe.UserDataBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UserDataBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.UserDataBody";
        };

        return UserDataBody;
    })();

    /**
     * MessageType enum.
     * @name tribe.MessageType
     * @enum {number}
     * @property {number} MESSAGE_TYPE_NONE=0 MESSAGE_TYPE_NONE value
     * @property {number} CAST_ADD=1 CAST_ADD value
     * @property {number} CAST_REMOVE=2 CAST_REMOVE value
     * @property {number} REACTION_ADD=3 REACTION_ADD value
     * @property {number} REACTION_REMOVE=4 REACTION_REMOVE value
     * @property {number} LINK_ADD=5 LINK_ADD value
     * @property {number} LINK_REMOVE=6 LINK_REMOVE value
     * @property {number} USER_DATA_ADD=7 USER_DATA_ADD value
     * @property {number} USERNAME_PROOF=8 USERNAME_PROOF value
     * @property {number} CHANNEL_ADD=9 CHANNEL_ADD value
     * @property {number} CHANNEL_JOIN=10 CHANNEL_JOIN value
     * @property {number} CHANNEL_LEAVE=11 CHANNEL_LEAVE value
     */
    tribe.MessageType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "MESSAGE_TYPE_NONE"] = 0;
        values[valuesById[1] = "CAST_ADD"] = 1;
        values[valuesById[2] = "CAST_REMOVE"] = 2;
        values[valuesById[3] = "REACTION_ADD"] = 3;
        values[valuesById[4] = "REACTION_REMOVE"] = 4;
        values[valuesById[5] = "LINK_ADD"] = 5;
        values[valuesById[6] = "LINK_REMOVE"] = 6;
        values[valuesById[7] = "USER_DATA_ADD"] = 7;
        values[valuesById[8] = "USERNAME_PROOF"] = 8;
        values[valuesById[9] = "CHANNEL_ADD"] = 9;
        values[valuesById[10] = "CHANNEL_JOIN"] = 10;
        values[valuesById[11] = "CHANNEL_LEAVE"] = 11;
        return values;
    })();

    /**
     * ReactionType enum.
     * @name tribe.ReactionType
     * @enum {number}
     * @property {number} REACTION_TYPE_NONE=0 REACTION_TYPE_NONE value
     * @property {number} LIKE=1 LIKE value
     * @property {number} RECAST=2 RECAST value
     */
    tribe.ReactionType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "REACTION_TYPE_NONE"] = 0;
        values[valuesById[1] = "LIKE"] = 1;
        values[valuesById[2] = "RECAST"] = 2;
        return values;
    })();

    /**
     * Network enum.
     * @name tribe.Network
     * @enum {number}
     * @property {number} NETWORK_NONE=0 NETWORK_NONE value
     * @property {number} MAINNET=1 MAINNET value
     * @property {number} DEVNET=2 DEVNET value
     */
    tribe.Network = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NETWORK_NONE"] = 0;
        values[valuesById[1] = "MAINNET"] = 1;
        values[valuesById[2] = "DEVNET"] = 2;
        return values;
    })();

    return tribe;
})();

module.exports = $root;
