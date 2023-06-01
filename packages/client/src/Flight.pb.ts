/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export const protobufPackage = "arrow.flight.protocol";

/** The request that a client provides to a server on handshake. */
export interface HandshakeRequest {
  /** A defined protocol version */
  protocolVersion: number;
  /** Arbitrary auth/handshake info. */
  payload: Uint8Array;
}

export interface HandshakeResponse {
  /** A defined protocol version */
  protocolVersion: number;
  /** Arbitrary auth/handshake info. */
  payload: Uint8Array;
}

/** A message for doing simple auth. */
export interface BasicAuth {
  username: string;
  password: string;
}

export interface Empty {
}

/**
 * Describes an available action, including both the name used for execution
 * along with a short description of the purpose of the action.
 */
export interface ActionType {
  type: string;
  description: string;
}

/**
 * A service specific expression that can be used to return a limited set
 * of available Arrow Flight streams.
 */
export interface Criteria {
  expression: Uint8Array;
}

/** An opaque action specific for the service. */
export interface Action {
  type: string;
  body: Uint8Array;
}

/** An opaque result returned after executing an action. */
export interface Result {
  body: Uint8Array;
}

/** Wrap the result of a getSchema call */
export interface SchemaResult {
  /**
   * The schema of the dataset in its IPC form:
   *   4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
   *   4 bytes - the byte length of the payload
   *   a flatbuffer Message whose header is the Schema
   */
  schema: Uint8Array;
}

/**
 * The name or tag for a Flight. May be used as a way to retrieve or generate
 * a flight or be used to expose a set of previously defined flights.
 */
export interface FlightDescriptor {
  type: FlightDescriptor_DescriptorType;
  /**
   * Opaque value used to express a command. Should only be defined when
   * type = CMD.
   */
  cmd: Uint8Array;
  /**
   * List of strings identifying a particular dataset. Should only be defined
   * when type = PATH.
   */
  path: string[];
}

/** Describes what type of descriptor is defined. */
export enum FlightDescriptor_DescriptorType {
  /** UNKNOWN - Protobuf pattern, not used. */
  UNKNOWN = 0,
  /**
   * PATH - A named path that identifies a dataset. A path is composed of a string
   * or list of strings describing a particular dataset. This is conceptually
   *  similar to a path inside a filesystem.
   */
  PATH = 1,
  /** CMD - An opaque command to generate a dataset. */
  CMD = 2,
  UNRECOGNIZED = -1,
}

export function flightDescriptor_DescriptorTypeFromJSON(object: any): FlightDescriptor_DescriptorType {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return FlightDescriptor_DescriptorType.UNKNOWN;
    case 1:
    case "PATH":
      return FlightDescriptor_DescriptorType.PATH;
    case 2:
    case "CMD":
      return FlightDescriptor_DescriptorType.CMD;
    case -1:
    case "UNRECOGNIZED":
    default:
      return FlightDescriptor_DescriptorType.UNRECOGNIZED;
  }
}

export function flightDescriptor_DescriptorTypeToJSON(object: FlightDescriptor_DescriptorType): string {
  switch (object) {
    case FlightDescriptor_DescriptorType.UNKNOWN:
      return "UNKNOWN";
    case FlightDescriptor_DescriptorType.PATH:
      return "PATH";
    case FlightDescriptor_DescriptorType.CMD:
      return "CMD";
    case FlightDescriptor_DescriptorType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * The access coordinates for retrieval of a dataset. With a FlightInfo, a
 * consumer is able to determine how to retrieve a dataset.
 */
export interface FlightInfo {
  /**
   * The schema of the dataset in its IPC form:
   *   4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
   *   4 bytes - the byte length of the payload
   *   a flatbuffer Message whose header is the Schema
   */
  schema: Uint8Array;
  /** The descriptor associated with this info. */
  flightDescriptor:
    | FlightDescriptor
    | undefined;
  /**
   * A list of endpoints associated with the flight. To consume the
   * whole flight, all endpoints (and hence all Tickets) must be
   * consumed. Endpoints can be consumed in any order.
   *
   * In other words, an application can use multiple endpoints to
   * represent partitioned data.
   *
   * If the returned data has an ordering, an application can use
   * "FlightInfo.ordered = true" or should return the all data in a
   * single endpoint. Otherwise, there is no ordering defined on
   * endpoints or the data within.
   *
   * A client can read ordered data by reading data from returned
   * endpoints, in order, from front to back.
   *
   * Note that a client may ignore "FlightInfo.ordered = true". If an
   * ordering is important for an application, an application must
   * choose one of them:
   *
   * * An application requires that all clients must read data in
   *   returned endpoints order.
   * * An application must return the all data in a single endpoint.
   */
  endpoint: FlightEndpoint[];
  /** Set these to -1 if unknown. */
  totalRecords: number;
  totalBytes: number;
  /** FlightEndpoints are in the same order as the data. */
  ordered: boolean;
}

/** A particular stream or split associated with a flight. */
export interface FlightEndpoint {
  /** Token used to retrieve this stream. */
  ticket:
    | Ticket
    | undefined;
  /**
   * A list of URIs where this ticket can be redeemed via DoGet().
   *
   * If the list is empty, the expectation is that the ticket can only
   * be redeemed on the current service where the ticket was
   * generated.
   *
   * If the list is not empty, the expectation is that the ticket can
   * be redeemed at any of the locations, and that the data returned
   * will be equivalent. In this case, the ticket may only be redeemed
   * at one of the given locations, and not (necessarily) on the
   * current service.
   *
   * In other words, an application can use multiple locations to
   * represent redundant and/or load balanced services.
   */
  location: Location[];
}

/**
 * A location where a Flight service will accept retrieval of a particular
 * stream given a ticket.
 */
export interface Location {
  uri: string;
}

/**
 * An opaque identifier that the service can use to retrieve a particular
 * portion of a stream.
 *
 * Tickets are meant to be single use. It is an error/application-defined
 * behavior to reuse a ticket.
 */
export interface Ticket {
  ticket: Uint8Array;
}

/** A batch of Arrow data as part of a stream of batches. */
export interface FlightData {
  /**
   * The descriptor of the data. This is only relevant when a client is
   * starting a new DoPut stream.
   */
  flightDescriptor:
    | FlightDescriptor
    | undefined;
  /** Header for message data as described in Message.fbs::Message. */
  dataHeader: Uint8Array;
  /** Application-defined metadata. */
  appMetadata: Uint8Array;
  /**
   * The actual batch of Arrow data. Preferably handled with minimal-copies
   * coming last in the definition to help with sidecar patterns (it is
   * expected that some implementations will fetch this field off the wire
   * with specialized code to avoid extra memory copies).
   */
  dataBody: Uint8Array;
}

/** The response message associated with the submission of a DoPut. */
export interface PutResult {
  appMetadata: Uint8Array;
}

function createBaseHandshakeRequest(): HandshakeRequest {
  return { protocolVersion: 0, payload: new Uint8Array() };
}

export const HandshakeRequest = {
  encode(message: HandshakeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocolVersion !== 0) {
      writer.uint32(8).uint64(message.protocolVersion);
    }
    if (message.payload.length !== 0) {
      writer.uint32(18).bytes(message.payload);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HandshakeRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHandshakeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.protocolVersion = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.payload = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): HandshakeRequest {
    return {
      protocolVersion: isSet(object.protocolVersion) ? Number(object.protocolVersion) : 0,
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(),
    };
  },

  toJSON(message: HandshakeRequest): unknown {
    const obj: any = {};
    message.protocolVersion !== undefined && (obj.protocolVersion = Math.round(message.protocolVersion));
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(message.payload !== undefined ? message.payload : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<HandshakeRequest>, I>>(base?: I): HandshakeRequest {
    return HandshakeRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<HandshakeRequest>, I>>(object: I): HandshakeRequest {
    const message = createBaseHandshakeRequest();
    message.protocolVersion = object.protocolVersion ?? 0;
    message.payload = object.payload ?? new Uint8Array();
    return message;
  },
};

function createBaseHandshakeResponse(): HandshakeResponse {
  return { protocolVersion: 0, payload: new Uint8Array() };
}

export const HandshakeResponse = {
  encode(message: HandshakeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocolVersion !== 0) {
      writer.uint32(8).uint64(message.protocolVersion);
    }
    if (message.payload.length !== 0) {
      writer.uint32(18).bytes(message.payload);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HandshakeResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHandshakeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.protocolVersion = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.payload = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): HandshakeResponse {
    return {
      protocolVersion: isSet(object.protocolVersion) ? Number(object.protocolVersion) : 0,
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(),
    };
  },

  toJSON(message: HandshakeResponse): unknown {
    const obj: any = {};
    message.protocolVersion !== undefined && (obj.protocolVersion = Math.round(message.protocolVersion));
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(message.payload !== undefined ? message.payload : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<HandshakeResponse>, I>>(base?: I): HandshakeResponse {
    return HandshakeResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<HandshakeResponse>, I>>(object: I): HandshakeResponse {
    const message = createBaseHandshakeResponse();
    message.protocolVersion = object.protocolVersion ?? 0;
    message.payload = object.payload ?? new Uint8Array();
    return message;
  },
};

function createBaseBasicAuth(): BasicAuth {
  return { username: "", password: "" };
}

export const BasicAuth = {
  encode(message: BasicAuth, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(18).string(message.username);
    }
    if (message.password !== "") {
      writer.uint32(26).string(message.password);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BasicAuth {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBasicAuth();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.username = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.password = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BasicAuth {
    return {
      username: isSet(object.username) ? String(object.username) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: BasicAuth): unknown {
    const obj: any = {};
    message.username !== undefined && (obj.username = message.username);
    message.password !== undefined && (obj.password = message.password);
    return obj;
  },

  create<I extends Exact<DeepPartial<BasicAuth>, I>>(base?: I): BasicAuth {
    return BasicAuth.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BasicAuth>, I>>(object: I): BasicAuth {
    const message = createBaseBasicAuth();
    message.username = object.username ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseEmpty(): Empty {
  return {};
}

export const Empty = {
  encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEmpty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): Empty {
    return {};
  },

  toJSON(_: Empty): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<Empty>, I>>(base?: I): Empty {
    return Empty.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Empty>, I>>(_: I): Empty {
    const message = createBaseEmpty();
    return message;
  },
};

function createBaseActionType(): ActionType {
  return { type: "", description: "" };
}

export const ActionType = {
  encode(message: ActionType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActionType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseActionType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ActionType {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      description: isSet(object.description) ? String(object.description) : "",
    };
  },

  toJSON(message: ActionType): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.description !== undefined && (obj.description = message.description);
    return obj;
  },

  create<I extends Exact<DeepPartial<ActionType>, I>>(base?: I): ActionType {
    return ActionType.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ActionType>, I>>(object: I): ActionType {
    const message = createBaseActionType();
    message.type = object.type ?? "";
    message.description = object.description ?? "";
    return message;
  },
};

function createBaseCriteria(): Criteria {
  return { expression: new Uint8Array() };
}

export const Criteria = {
  encode(message: Criteria, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.expression.length !== 0) {
      writer.uint32(10).bytes(message.expression);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Criteria {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCriteria();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expression = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Criteria {
    return { expression: isSet(object.expression) ? bytesFromBase64(object.expression) : new Uint8Array() };
  },

  toJSON(message: Criteria): unknown {
    const obj: any = {};
    message.expression !== undefined &&
      (obj.expression = base64FromBytes(message.expression !== undefined ? message.expression : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<Criteria>, I>>(base?: I): Criteria {
    return Criteria.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Criteria>, I>>(object: I): Criteria {
    const message = createBaseCriteria();
    message.expression = object.expression ?? new Uint8Array();
    return message;
  },
};

function createBaseAction(): Action {
  return { type: "", body: new Uint8Array() };
}

export const Action = {
  encode(message: Action, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.body.length !== 0) {
      writer.uint32(18).bytes(message.body);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Action {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.body = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Action {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      body: isSet(object.body) ? bytesFromBase64(object.body) : new Uint8Array(),
    };
  },

  toJSON(message: Action): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.body !== undefined &&
      (obj.body = base64FromBytes(message.body !== undefined ? message.body : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<Action>, I>>(base?: I): Action {
    return Action.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Action>, I>>(object: I): Action {
    const message = createBaseAction();
    message.type = object.type ?? "";
    message.body = object.body ?? new Uint8Array();
    return message;
  },
};

function createBaseResult(): Result {
  return { body: new Uint8Array() };
}

export const Result = {
  encode(message: Result, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.body.length !== 0) {
      writer.uint32(10).bytes(message.body);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Result {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.body = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Result {
    return { body: isSet(object.body) ? bytesFromBase64(object.body) : new Uint8Array() };
  },

  toJSON(message: Result): unknown {
    const obj: any = {};
    message.body !== undefined &&
      (obj.body = base64FromBytes(message.body !== undefined ? message.body : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<Result>, I>>(base?: I): Result {
    return Result.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Result>, I>>(object: I): Result {
    const message = createBaseResult();
    message.body = object.body ?? new Uint8Array();
    return message;
  },
};

function createBaseSchemaResult(): SchemaResult {
  return { schema: new Uint8Array() };
}

export const SchemaResult = {
  encode(message: SchemaResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.schema.length !== 0) {
      writer.uint32(10).bytes(message.schema);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SchemaResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSchemaResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.schema = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SchemaResult {
    return { schema: isSet(object.schema) ? bytesFromBase64(object.schema) : new Uint8Array() };
  },

  toJSON(message: SchemaResult): unknown {
    const obj: any = {};
    message.schema !== undefined &&
      (obj.schema = base64FromBytes(message.schema !== undefined ? message.schema : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<SchemaResult>, I>>(base?: I): SchemaResult {
    return SchemaResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SchemaResult>, I>>(object: I): SchemaResult {
    const message = createBaseSchemaResult();
    message.schema = object.schema ?? new Uint8Array();
    return message;
  },
};

function createBaseFlightDescriptor(): FlightDescriptor {
  return { type: 0, cmd: new Uint8Array(), path: [] };
}

export const FlightDescriptor = {
  encode(message: FlightDescriptor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.cmd.length !== 0) {
      writer.uint32(18).bytes(message.cmd);
    }
    for (const v of message.path) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FlightDescriptor {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFlightDescriptor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.cmd = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.path.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FlightDescriptor {
    return {
      type: isSet(object.type) ? flightDescriptor_DescriptorTypeFromJSON(object.type) : 0,
      cmd: isSet(object.cmd) ? bytesFromBase64(object.cmd) : new Uint8Array(),
      path: Array.isArray(object?.path) ? object.path.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: FlightDescriptor): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = flightDescriptor_DescriptorTypeToJSON(message.type));
    message.cmd !== undefined &&
      (obj.cmd = base64FromBytes(message.cmd !== undefined ? message.cmd : new Uint8Array()));
    if (message.path) {
      obj.path = message.path.map((e) => e);
    } else {
      obj.path = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FlightDescriptor>, I>>(base?: I): FlightDescriptor {
    return FlightDescriptor.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FlightDescriptor>, I>>(object: I): FlightDescriptor {
    const message = createBaseFlightDescriptor();
    message.type = object.type ?? 0;
    message.cmd = object.cmd ?? new Uint8Array();
    message.path = object.path?.map((e) => e) || [];
    return message;
  },
};

function createBaseFlightInfo(): FlightInfo {
  return {
    schema: new Uint8Array(),
    flightDescriptor: undefined,
    endpoint: [],
    totalRecords: 0,
    totalBytes: 0,
    ordered: false,
  };
}

export const FlightInfo = {
  encode(message: FlightInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.schema.length !== 0) {
      writer.uint32(10).bytes(message.schema);
    }
    if (message.flightDescriptor !== undefined) {
      FlightDescriptor.encode(message.flightDescriptor, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.endpoint) {
      FlightEndpoint.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.totalRecords !== 0) {
      writer.uint32(32).int64(message.totalRecords);
    }
    if (message.totalBytes !== 0) {
      writer.uint32(40).int64(message.totalBytes);
    }
    if (message.ordered === true) {
      writer.uint32(48).bool(message.ordered);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FlightInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFlightInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.schema = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.flightDescriptor = FlightDescriptor.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.endpoint.push(FlightEndpoint.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.totalRecords = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.totalBytes = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.ordered = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FlightInfo {
    return {
      schema: isSet(object.schema) ? bytesFromBase64(object.schema) : new Uint8Array(),
      flightDescriptor: isSet(object.flightDescriptor) ? FlightDescriptor.fromJSON(object.flightDescriptor) : undefined,
      endpoint: Array.isArray(object?.endpoint) ? object.endpoint.map((e: any) => FlightEndpoint.fromJSON(e)) : [],
      totalRecords: isSet(object.totalRecords) ? Number(object.totalRecords) : 0,
      totalBytes: isSet(object.totalBytes) ? Number(object.totalBytes) : 0,
      ordered: isSet(object.ordered) ? Boolean(object.ordered) : false,
    };
  },

  toJSON(message: FlightInfo): unknown {
    const obj: any = {};
    message.schema !== undefined &&
      (obj.schema = base64FromBytes(message.schema !== undefined ? message.schema : new Uint8Array()));
    message.flightDescriptor !== undefined &&
      (obj.flightDescriptor = message.flightDescriptor ? FlightDescriptor.toJSON(message.flightDescriptor) : undefined);
    if (message.endpoint) {
      obj.endpoint = message.endpoint.map((e) => e ? FlightEndpoint.toJSON(e) : undefined);
    } else {
      obj.endpoint = [];
    }
    message.totalRecords !== undefined && (obj.totalRecords = Math.round(message.totalRecords));
    message.totalBytes !== undefined && (obj.totalBytes = Math.round(message.totalBytes));
    message.ordered !== undefined && (obj.ordered = message.ordered);
    return obj;
  },

  create<I extends Exact<DeepPartial<FlightInfo>, I>>(base?: I): FlightInfo {
    return FlightInfo.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FlightInfo>, I>>(object: I): FlightInfo {
    const message = createBaseFlightInfo();
    message.schema = object.schema ?? new Uint8Array();
    message.flightDescriptor = (object.flightDescriptor !== undefined && object.flightDescriptor !== null)
      ? FlightDescriptor.fromPartial(object.flightDescriptor)
      : undefined;
    message.endpoint = object.endpoint?.map((e) => FlightEndpoint.fromPartial(e)) || [];
    message.totalRecords = object.totalRecords ?? 0;
    message.totalBytes = object.totalBytes ?? 0;
    message.ordered = object.ordered ?? false;
    return message;
  },
};

function createBaseFlightEndpoint(): FlightEndpoint {
  return { ticket: undefined, location: [] };
}

export const FlightEndpoint = {
  encode(message: FlightEndpoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ticket !== undefined) {
      Ticket.encode(message.ticket, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.location) {
      Location.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FlightEndpoint {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFlightEndpoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ticket = Ticket.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.location.push(Location.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FlightEndpoint {
    return {
      ticket: isSet(object.ticket) ? Ticket.fromJSON(object.ticket) : undefined,
      location: Array.isArray(object?.location) ? object.location.map((e: any) => Location.fromJSON(e)) : [],
    };
  },

  toJSON(message: FlightEndpoint): unknown {
    const obj: any = {};
    message.ticket !== undefined && (obj.ticket = message.ticket ? Ticket.toJSON(message.ticket) : undefined);
    if (message.location) {
      obj.location = message.location.map((e) => e ? Location.toJSON(e) : undefined);
    } else {
      obj.location = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FlightEndpoint>, I>>(base?: I): FlightEndpoint {
    return FlightEndpoint.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FlightEndpoint>, I>>(object: I): FlightEndpoint {
    const message = createBaseFlightEndpoint();
    message.ticket = (object.ticket !== undefined && object.ticket !== null)
      ? Ticket.fromPartial(object.ticket)
      : undefined;
    message.location = object.location?.map((e) => Location.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLocation(): Location {
  return { uri: "" };
}

export const Location = {
  encode(message: Location, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uri !== "") {
      writer.uint32(10).string(message.uri);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Location {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLocation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uri = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Location {
    return { uri: isSet(object.uri) ? String(object.uri) : "" };
  },

  toJSON(message: Location): unknown {
    const obj: any = {};
    message.uri !== undefined && (obj.uri = message.uri);
    return obj;
  },

  create<I extends Exact<DeepPartial<Location>, I>>(base?: I): Location {
    return Location.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Location>, I>>(object: I): Location {
    const message = createBaseLocation();
    message.uri = object.uri ?? "";
    return message;
  },
};

function createBaseTicket(): Ticket {
  return { ticket: new Uint8Array() };
}

export const Ticket = {
  encode(message: Ticket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ticket.length !== 0) {
      writer.uint32(10).bytes(message.ticket);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Ticket {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTicket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ticket = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Ticket {
    return { ticket: isSet(object.ticket) ? bytesFromBase64(object.ticket) : new Uint8Array() };
  },

  toJSON(message: Ticket): unknown {
    const obj: any = {};
    message.ticket !== undefined &&
      (obj.ticket = base64FromBytes(message.ticket !== undefined ? message.ticket : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<Ticket>, I>>(base?: I): Ticket {
    return Ticket.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Ticket>, I>>(object: I): Ticket {
    const message = createBaseTicket();
    message.ticket = object.ticket ?? new Uint8Array();
    return message;
  },
};

function createBaseFlightData(): FlightData {
  return {
    flightDescriptor: undefined,
    dataHeader: new Uint8Array(),
    appMetadata: new Uint8Array(),
    dataBody: new Uint8Array(),
  };
}

export const FlightData = {
  encode(message: FlightData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.flightDescriptor !== undefined) {
      FlightDescriptor.encode(message.flightDescriptor, writer.uint32(10).fork()).ldelim();
    }
    if (message.dataHeader.length !== 0) {
      writer.uint32(18).bytes(message.dataHeader);
    }
    if (message.appMetadata.length !== 0) {
      writer.uint32(26).bytes(message.appMetadata);
    }
    if (message.dataBody.length !== 0) {
      writer.uint32(8002).bytes(message.dataBody);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FlightData {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFlightData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.flightDescriptor = FlightDescriptor.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.dataHeader = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.appMetadata = reader.bytes();
          continue;
        case 1000:
          if (tag !== 8002) {
            break;
          }

          message.dataBody = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FlightData {
    return {
      flightDescriptor: isSet(object.flightDescriptor) ? FlightDescriptor.fromJSON(object.flightDescriptor) : undefined,
      dataHeader: isSet(object.dataHeader) ? bytesFromBase64(object.dataHeader) : new Uint8Array(),
      appMetadata: isSet(object.appMetadata) ? bytesFromBase64(object.appMetadata) : new Uint8Array(),
      dataBody: isSet(object.dataBody) ? bytesFromBase64(object.dataBody) : new Uint8Array(),
    };
  },

  toJSON(message: FlightData): unknown {
    const obj: any = {};
    message.flightDescriptor !== undefined &&
      (obj.flightDescriptor = message.flightDescriptor ? FlightDescriptor.toJSON(message.flightDescriptor) : undefined);
    message.dataHeader !== undefined &&
      (obj.dataHeader = base64FromBytes(message.dataHeader !== undefined ? message.dataHeader : new Uint8Array()));
    message.appMetadata !== undefined &&
      (obj.appMetadata = base64FromBytes(message.appMetadata !== undefined ? message.appMetadata : new Uint8Array()));
    message.dataBody !== undefined &&
      (obj.dataBody = base64FromBytes(message.dataBody !== undefined ? message.dataBody : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<FlightData>, I>>(base?: I): FlightData {
    return FlightData.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FlightData>, I>>(object: I): FlightData {
    const message = createBaseFlightData();
    message.flightDescriptor = (object.flightDescriptor !== undefined && object.flightDescriptor !== null)
      ? FlightDescriptor.fromPartial(object.flightDescriptor)
      : undefined;
    message.dataHeader = object.dataHeader ?? new Uint8Array();
    message.appMetadata = object.appMetadata ?? new Uint8Array();
    message.dataBody = object.dataBody ?? new Uint8Array();
    return message;
  },
};

function createBasePutResult(): PutResult {
  return { appMetadata: new Uint8Array() };
}

export const PutResult = {
  encode(message: PutResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.appMetadata.length !== 0) {
      writer.uint32(10).bytes(message.appMetadata);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PutResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePutResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.appMetadata = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PutResult {
    return { appMetadata: isSet(object.appMetadata) ? bytesFromBase64(object.appMetadata) : new Uint8Array() };
  },

  toJSON(message: PutResult): unknown {
    const obj: any = {};
    message.appMetadata !== undefined &&
      (obj.appMetadata = base64FromBytes(message.appMetadata !== undefined ? message.appMetadata : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<PutResult>, I>>(base?: I): PutResult {
    return PutResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PutResult>, I>>(object: I): PutResult {
    const message = createBasePutResult();
    message.appMetadata = object.appMetadata ?? new Uint8Array();
    return message;
  },
};

/**
 * A flight service is an endpoint for retrieving or storing Arrow data. A
 * flight service can expose one or more predefined endpoints that can be
 * accessed using the Arrow Flight Protocol. Additionally, a flight service
 * can expose a set of actions that are available.
 */
export interface FlightService {
  /**
   * Handshake between client and server. Depending on the server, the
   * handshake may be required to determine the token that should be used for
   * future operations. Both request and response are streams to allow multiple
   * round-trips depending on auth mechanism.
   */
  Handshake(request: Observable<HandshakeRequest>): Observable<HandshakeResponse>;
  /**
   * Get a list of available streams given a particular criteria. Most flight
   * services will expose one or more streams that are readily available for
   * retrieval. This api allows listing the streams available for
   * consumption. A user can also provide a criteria. The criteria can limit
   * the subset of streams that can be listed via this interface. Each flight
   * service allows its own definition of how to consume criteria.
   */
  ListFlights(request: Criteria): Observable<FlightInfo>;
  /**
   * For a given FlightDescriptor, get information about how the flight can be
   * consumed. This is a useful interface if the consumer of the interface
   * already can identify the specific flight to consume. This interface can
   * also allow a consumer to generate a flight stream through a specified
   * descriptor. For example, a flight descriptor might be something that
   * includes a SQL statement or a Pickled Python operation that will be
   * executed. In those cases, the descriptor will not be previously available
   * within the list of available streams provided by ListFlights but will be
   * available for consumption for the duration defined by the specific flight
   * service.
   */
  GetFlightInfo(request: FlightDescriptor): Promise<FlightInfo>;
  /**
   * For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
   * This is used when a consumer needs the Schema of flight stream. Similar to
   * GetFlightInfo this interface may generate a new flight that was not previously
   * available in ListFlights.
   */
  GetSchema(request: FlightDescriptor): Promise<SchemaResult>;
  /**
   * Retrieve a single stream associated with a particular descriptor
   * associated with the referenced ticket. A Flight can be composed of one or
   * more streams where each stream can be retrieved using a separate opaque
   * ticket that the flight service uses for managing a collection of streams.
   */
  DoGet(request: Ticket): Observable<FlightData>;
  /**
   * Push a stream to the flight service associated with a particular
   * flight stream. This allows a client of a flight service to upload a stream
   * of data. Depending on the particular flight service, a client consumer
   * could be allowed to upload a single stream per descriptor or an unlimited
   * number. In the latter, the service might implement a 'seal' action that
   * can be applied to a descriptor once all streams are uploaded.
   */
  DoPut(request: Observable<FlightData>): Observable<PutResult>;
  /**
   * Open a bidirectional data channel for a given descriptor. This
   * allows clients to send and receive arbitrary Arrow data and
   * application-specific metadata in a single logical stream. In
   * contrast to DoGet/DoPut, this is more suited for clients
   * offloading computation (rather than storage) to a Flight service.
   */
  DoExchange(request: Observable<FlightData>): Observable<FlightData>;
  /**
   * Flight services can support an arbitrary number of simple actions in
   * addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
   * operations that are potentially available. DoAction allows a flight client
   * to do a specific action against a flight service. An action includes
   * opaque request and response objects that are specific to the type action
   * being undertaken.
   */
  DoAction(request: Action): Observable<Result>;
  /**
   * A flight service exposes all of the available action types that it has
   * along with descriptions. This allows different flight consumers to
   * understand the capabilities of the flight service.
   */
  ListActions(request: Empty): Observable<ActionType>;
}

export class FlightServiceClientImpl implements FlightService {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "arrow.flight.protocol.FlightService";
    this.rpc = rpc;
    this.Handshake = this.Handshake.bind(this);
    this.ListFlights = this.ListFlights.bind(this);
    this.GetFlightInfo = this.GetFlightInfo.bind(this);
    this.GetSchema = this.GetSchema.bind(this);
    this.DoGet = this.DoGet.bind(this);
    this.DoPut = this.DoPut.bind(this);
    this.DoExchange = this.DoExchange.bind(this);
    this.DoAction = this.DoAction.bind(this);
    this.ListActions = this.ListActions.bind(this);
  }
  Handshake(request: Observable<HandshakeRequest>): Observable<HandshakeResponse> {
    const data = request.pipe(map((request) => HandshakeRequest.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "Handshake", data);
    return result.pipe(map((data) => HandshakeResponse.decode(_m0.Reader.create(data))));
  }

  ListFlights(request: Criteria): Observable<FlightInfo> {
    const data = Criteria.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "ListFlights", data);
    return result.pipe(map((data) => FlightInfo.decode(_m0.Reader.create(data))));
  }

  GetFlightInfo(request: FlightDescriptor): Promise<FlightInfo> {
    const data = FlightDescriptor.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetFlightInfo", data);
    return promise.then((data) => FlightInfo.decode(_m0.Reader.create(data)));
  }

  GetSchema(request: FlightDescriptor): Promise<SchemaResult> {
    const data = FlightDescriptor.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetSchema", data);
    return promise.then((data) => SchemaResult.decode(_m0.Reader.create(data)));
  }

  DoGet(request: Ticket): Observable<FlightData> {
    const data = Ticket.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "DoGet", data);
    return result.pipe(map((data) => FlightData.decode(_m0.Reader.create(data))));
  }

  DoPut(request: Observable<FlightData>): Observable<PutResult> {
    const data = request.pipe(map((request) => FlightData.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "DoPut", data);
    return result.pipe(map((data) => PutResult.decode(_m0.Reader.create(data))));
  }

  DoExchange(request: Observable<FlightData>): Observable<FlightData> {
    const data = request.pipe(map((request) => FlightData.encode(request).finish()));
    const result = this.rpc.bidirectionalStreamingRequest(this.service, "DoExchange", data);
    return result.pipe(map((data) => FlightData.decode(_m0.Reader.create(data))));
  }

  DoAction(request: Action): Observable<Result> {
    const data = Action.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "DoAction", data);
    return result.pipe(map((data) => Result.decode(_m0.Reader.create(data))));
  }

  ListActions(request: Empty): Observable<ActionType> {
    const data = Empty.encode(request).finish();
    const result = this.rpc.serverStreamingRequest(this.service, "ListActions", data);
    return result.pipe(map((data) => ActionType.decode(_m0.Reader.create(data))));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
  clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
  serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
  bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
