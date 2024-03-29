// @generated by protobuf-ts 2.9.1 with parameter optimize_code_size
// @generated from protobuf file "Flight.proto" (package "arrow.flight.protocol", syntax proto3)
// tslint:disable
//
//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
// <p>
// http://www.apache.org/licenses/LICENSE-2.0
// <p>
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import { MessageType } from "@protobuf-ts/runtime";
import { Timestamp } from "./google/protobuf/timestamp";
/**
 *
 * The request that a client provides to a server on handshake.
 *
 * @generated from protobuf message arrow.flight.protocol.HandshakeRequest
 */
export interface HandshakeRequest {
    /**
     *
     * A defined protocol version
     *
     * @generated from protobuf field: uint64 protocol_version = 1;
     */
    protocolVersion: bigint;
    /**
     *
     * Arbitrary auth/handshake info.
     *
     * @generated from protobuf field: bytes payload = 2;
     */
    payload: Uint8Array;
}
/**
 * @generated from protobuf message arrow.flight.protocol.HandshakeResponse
 */
export interface HandshakeResponse {
    /**
     *
     * A defined protocol version
     *
     * @generated from protobuf field: uint64 protocol_version = 1;
     */
    protocolVersion: bigint;
    /**
     *
     * Arbitrary auth/handshake info.
     *
     * @generated from protobuf field: bytes payload = 2;
     */
    payload: Uint8Array;
}
/**
 *
 * A message for doing simple auth.
 *
 * @generated from protobuf message arrow.flight.protocol.BasicAuth
 */
export interface BasicAuth {
    /**
     * @generated from protobuf field: string username = 2;
     */
    username: string;
    /**
     * @generated from protobuf field: string password = 3;
     */
    password: string;
}
/**
 * @generated from protobuf message arrow.flight.protocol.Empty
 */
export interface Empty {
}
/**
 *
 * Describes an available action, including both the name used for execution
 * along with a short description of the purpose of the action.
 *
 * @generated from protobuf message arrow.flight.protocol.ActionType
 */
export interface ActionType {
    /**
     * @generated from protobuf field: string type = 1;
     */
    type: string;
    /**
     * @generated from protobuf field: string description = 2;
     */
    description: string;
}
/**
 *
 * A service specific expression that can be used to return a limited set
 * of available Arrow Flight streams.
 *
 * @generated from protobuf message arrow.flight.protocol.Criteria
 */
export interface Criteria {
    /**
     * @generated from protobuf field: bytes expression = 1;
     */
    expression: Uint8Array;
}
/**
 *
 * An opaque action specific for the service.
 *
 * @generated from protobuf message arrow.flight.protocol.Action
 */
export interface Action {
    /**
     * @generated from protobuf field: string type = 1;
     */
    type: string;
    /**
     * @generated from protobuf field: bytes body = 2;
     */
    body: Uint8Array;
}
/**
 *
 * The request of the CancelFlightInfo action.
 *
 * The request should be stored in Action.body.
 *
 * @generated from protobuf message arrow.flight.protocol.CancelFlightInfoRequest
 */
export interface CancelFlightInfoRequest {
    /**
     * @generated from protobuf field: arrow.flight.protocol.FlightInfo info = 1;
     */
    info?: FlightInfo;
}
/**
 *
 * The request of the RenewFlightEndpoint action.
 *
 * The request should be stored in Action.body.
 *
 * @generated from protobuf message arrow.flight.protocol.RenewFlightEndpointRequest
 */
export interface RenewFlightEndpointRequest {
    /**
     * @generated from protobuf field: arrow.flight.protocol.FlightEndpoint endpoint = 1;
     */
    endpoint?: FlightEndpoint;
}
/**
 *
 * An opaque result returned after executing an action.
 *
 * @generated from protobuf message arrow.flight.protocol.Result
 */
export interface Result {
    /**
     * @generated from protobuf field: bytes body = 1;
     */
    body: Uint8Array;
}
/**
 *
 * The result of the CancelFlightInfo action.
 *
 * The result should be stored in Result.body.
 *
 * @generated from protobuf message arrow.flight.protocol.CancelFlightInfoResult
 */
export interface CancelFlightInfoResult {
    /**
     * @generated from protobuf field: arrow.flight.protocol.CancelStatus status = 1;
     */
    status: CancelStatus;
}
/**
 *
 * Wrap the result of a getSchema call
 *
 * @generated from protobuf message arrow.flight.protocol.SchemaResult
 */
export interface SchemaResult {
    /**
     * The schema of the dataset in its IPC form:
     *   4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
     *   4 bytes - the byte length of the payload
     *   a flatbuffer Message whose header is the Schema
     *
     * @generated from protobuf field: bytes schema = 1;
     */
    schema: Uint8Array;
}
/**
 *
 * The name or tag for a Flight. May be used as a way to retrieve or generate
 * a flight or be used to expose a set of previously defined flights.
 *
 * @generated from protobuf message arrow.flight.protocol.FlightDescriptor
 */
export interface FlightDescriptor {
    /**
     * @generated from protobuf field: arrow.flight.protocol.FlightDescriptor.DescriptorType type = 1;
     */
    type: FlightDescriptor_DescriptorType;
    /**
     *
     * Opaque value used to express a command. Should only be defined when
     * type = CMD.
     *
     * @generated from protobuf field: bytes cmd = 2;
     */
    cmd: Uint8Array;
    /**
     *
     * List of strings identifying a particular dataset. Should only be defined
     * when type = PATH.
     *
     * @generated from protobuf field: repeated string path = 3;
     */
    path: string[];
}
/**
 *
 * Describes what type of descriptor is defined.
 *
 * @generated from protobuf enum arrow.flight.protocol.FlightDescriptor.DescriptorType
 */
export enum FlightDescriptor_DescriptorType {
    /**
     * Protobuf pattern, not used.
     *
     * @generated from protobuf enum value: UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     *
     * A named path that identifies a dataset. A path is composed of a string
     * or list of strings describing a particular dataset. This is conceptually
     *  similar to a path inside a filesystem.
     *
     * @generated from protobuf enum value: PATH = 1;
     */
    PATH = 1,
    /**
     *
     * An opaque command to generate a dataset.
     *
     * @generated from protobuf enum value: CMD = 2;
     */
    CMD = 2
}
/**
 *
 * The access coordinates for retrieval of a dataset. With a FlightInfo, a
 * consumer is able to determine how to retrieve a dataset.
 *
 * @generated from protobuf message arrow.flight.protocol.FlightInfo
 */
export interface FlightInfo {
    /**
     * The schema of the dataset in its IPC form:
     *   4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
     *   4 bytes - the byte length of the payload
     *   a flatbuffer Message whose header is the Schema
     *
     * @generated from protobuf field: bytes schema = 1;
     */
    schema: Uint8Array;
    /**
     *
     * The descriptor associated with this info.
     *
     * @generated from protobuf field: arrow.flight.protocol.FlightDescriptor flight_descriptor = 2;
     */
    flightDescriptor?: FlightDescriptor;
    /**
     *
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
     *
     * @generated from protobuf field: repeated arrow.flight.protocol.FlightEndpoint endpoint = 3;
     */
    endpoint: FlightEndpoint[];
    /**
     * Set these to -1 if unknown.
     *
     * @generated from protobuf field: int64 total_records = 4;
     */
    totalRecords: bigint;
    /**
     * @generated from protobuf field: int64 total_bytes = 5;
     */
    totalBytes: bigint;
    /**
     *
     * FlightEndpoints are in the same order as the data.
     *
     * @generated from protobuf field: bool ordered = 6;
     */
    ordered: boolean;
    /**
     *
     * Application-defined metadata.
     *
     * There is no inherent or required relationship between this
     * and the app_metadata fields in the FlightEndpoints or resulting
     * FlightData messages. Since this metadata is application-defined,
     * a given application could define there to be a relationship,
     * but there is none required by the spec.
     *
     * @generated from protobuf field: bytes app_metadata = 7;
     */
    appMetadata: Uint8Array;
}
/**
 *
 * The information to process a long-running query.
 *
 * @generated from protobuf message arrow.flight.protocol.PollInfo
 */
export interface PollInfo {
    /**
     *
     * The currently available results.
     *
     * If "flight_descriptor" is not specified, the query is complete
     * and "info" specifies all results. Otherwise, "info" contains
     * partial query results.
     *
     * Note that each PollInfo response contains a complete
     * FlightInfo (not just the delta between the previous and current
     * FlightInfo).
     *
     * Subsequent PollInfo responses may only append new endpoints to
     * info.
     *
     * Clients can begin fetching results via DoGet(Ticket) with the
     * ticket in the info before the query is
     * completed. FlightInfo.ordered is also valid.
     *
     * @generated from protobuf field: arrow.flight.protocol.FlightInfo info = 1;
     */
    info?: FlightInfo;
    /**
     *
     * The descriptor the client should use on the next try.
     * If unset, the query is complete.
     *
     * @generated from protobuf field: arrow.flight.protocol.FlightDescriptor flight_descriptor = 2;
     */
    flightDescriptor?: FlightDescriptor;
    /**
     *
     * Query progress. If known, must be in [0.0, 1.0] but need not be
     * monotonic or nondecreasing. If unknown, do not set.
     *
     * @generated from protobuf field: optional double progress = 3;
     */
    progress?: number;
    /**
     *
     * Expiration time for this request. After this passes, the server
     * might not accept the retry descriptor anymore (and the query may
     * be cancelled). This may be updated on a call to PollFlightInfo.
     *
     * @generated from protobuf field: google.protobuf.Timestamp expiration_time = 4;
     */
    expirationTime?: Timestamp;
}
/**
 *
 * A particular stream or split associated with a flight.
 *
 * @generated from protobuf message arrow.flight.protocol.FlightEndpoint
 */
export interface FlightEndpoint {
    /**
     *
     * Token used to retrieve this stream.
     *
     * @generated from protobuf field: arrow.flight.protocol.Ticket ticket = 1;
     */
    ticket?: Ticket;
    /**
     *
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
     *
     * @generated from protobuf field: repeated arrow.flight.protocol.Location location = 2;
     */
    location: Location[];
    /**
     *
     * Expiration time of this stream. If present, clients may assume
     * they can retry DoGet requests. Otherwise, it is
     * application-defined whether DoGet requests may be retried.
     *
     * @generated from protobuf field: google.protobuf.Timestamp expiration_time = 3;
     */
    expirationTime?: Timestamp;
    /**
     *
     * Application-defined metadata.
     *
     * There is no inherent or required relationship between this
     * and the app_metadata fields in the FlightInfo or resulting
     * FlightData messages. Since this metadata is application-defined,
     * a given application could define there to be a relationship,
     * but there is none required by the spec.
     *
     * @generated from protobuf field: bytes app_metadata = 4;
     */
    appMetadata: Uint8Array;
}
/**
 *
 * A location where a Flight service will accept retrieval of a particular
 * stream given a ticket.
 *
 * @generated from protobuf message arrow.flight.protocol.Location
 */
export interface Location {
    /**
     * @generated from protobuf field: string uri = 1;
     */
    uri: string;
}
/**
 *
 * An opaque identifier that the service can use to retrieve a particular
 * portion of a stream.
 *
 * Tickets are meant to be single use. It is an error/application-defined
 * behavior to reuse a ticket.
 *
 * @generated from protobuf message arrow.flight.protocol.Ticket
 */
export interface Ticket {
    /**
     * @generated from protobuf field: bytes ticket = 1;
     */
    ticket: Uint8Array;
}
/**
 *
 * A batch of Arrow data as part of a stream of batches.
 *
 * @generated from protobuf message arrow.flight.protocol.FlightData
 */
export interface FlightData {
    /**
     *
     * The descriptor of the data. This is only relevant when a client is
     * starting a new DoPut stream.
     *
     * @generated from protobuf field: arrow.flight.protocol.FlightDescriptor flight_descriptor = 1;
     */
    flightDescriptor?: FlightDescriptor;
    /**
     *
     * Header for message data as described in Message.fbs::Message.
     *
     * @generated from protobuf field: bytes data_header = 2;
     */
    dataHeader: Uint8Array;
    /**
     *
     * Application-defined metadata.
     *
     * @generated from protobuf field: bytes app_metadata = 3;
     */
    appMetadata: Uint8Array;
    /**
     *
     * The actual batch of Arrow data. Preferably handled with minimal-copies
     * coming last in the definition to help with sidecar patterns (it is
     * expected that some implementations will fetch this field off the wire
     * with specialized code to avoid extra memory copies).
     *
     * @generated from protobuf field: bytes data_body = 1000;
     */
    dataBody: Uint8Array;
}
/**
 * *
 * The response message associated with the submission of a DoPut.
 *
 * @generated from protobuf message arrow.flight.protocol.PutResult
 */
export interface PutResult {
    /**
     * @generated from protobuf field: bytes app_metadata = 1;
     */
    appMetadata: Uint8Array;
}
/**
 *
 * The result of a cancel operation.
 *
 * This is used by CancelFlightInfoResult.status.
 *
 * @generated from protobuf enum arrow.flight.protocol.CancelStatus
 */
export enum CancelStatus {
    /**
     * The cancellation status is unknown. Servers should avoid using
     * this value (send a NOT_FOUND error if the requested query is
     * not known). Clients can retry the request.
     *
     * @generated from protobuf enum value: CANCEL_STATUS_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * The cancellation request is complete. Subsequent requests with
     * the same payload may return CANCELLED or a NOT_FOUND error.
     *
     * @generated from protobuf enum value: CANCEL_STATUS_CANCELLED = 1;
     */
    CANCELLED = 1,
    /**
     * The cancellation request is in progress. The client may retry
     * the cancellation request.
     *
     * @generated from protobuf enum value: CANCEL_STATUS_CANCELLING = 2;
     */
    CANCELLING = 2,
    /**
     * The query is not cancellable. The client should not retry the
     * cancellation request.
     *
     * @generated from protobuf enum value: CANCEL_STATUS_NOT_CANCELLABLE = 3;
     */
    NOT_CANCELLABLE = 3
}
// @generated message type with reflection information, may provide speed optimized methods
class HandshakeRequest$Type extends MessageType<HandshakeRequest> {
    constructor() {
        super("arrow.flight.protocol.HandshakeRequest", [
            { no: 1, name: "protocol_version", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 2, name: "payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.HandshakeRequest
 */
export const HandshakeRequest = new HandshakeRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class HandshakeResponse$Type extends MessageType<HandshakeResponse> {
    constructor() {
        super("arrow.flight.protocol.HandshakeResponse", [
            { no: 1, name: "protocol_version", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 2, name: "payload", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.HandshakeResponse
 */
export const HandshakeResponse = new HandshakeResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class BasicAuth$Type extends MessageType<BasicAuth> {
    constructor() {
        super("arrow.flight.protocol.BasicAuth", [
            { no: 2, name: "username", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "password", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.BasicAuth
 */
export const BasicAuth = new BasicAuth$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Empty$Type extends MessageType<Empty> {
    constructor() {
        super("arrow.flight.protocol.Empty", []);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.Empty
 */
export const Empty = new Empty$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ActionType$Type extends MessageType<ActionType> {
    constructor() {
        super("arrow.flight.protocol.ActionType", [
            { no: 1, name: "type", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "description", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.ActionType
 */
export const ActionType = new ActionType$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Criteria$Type extends MessageType<Criteria> {
    constructor() {
        super("arrow.flight.protocol.Criteria", [
            { no: 1, name: "expression", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.Criteria
 */
export const Criteria = new Criteria$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Action$Type extends MessageType<Action> {
    constructor() {
        super("arrow.flight.protocol.Action", [
            { no: 1, name: "type", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.Action
 */
export const Action = new Action$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CancelFlightInfoRequest$Type extends MessageType<CancelFlightInfoRequest> {
    constructor() {
        super("arrow.flight.protocol.CancelFlightInfoRequest", [
            { no: 1, name: "info", kind: "message", T: () => FlightInfo }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.CancelFlightInfoRequest
 */
export const CancelFlightInfoRequest = new CancelFlightInfoRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class RenewFlightEndpointRequest$Type extends MessageType<RenewFlightEndpointRequest> {
    constructor() {
        super("arrow.flight.protocol.RenewFlightEndpointRequest", [
            { no: 1, name: "endpoint", kind: "message", T: () => FlightEndpoint }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.RenewFlightEndpointRequest
 */
export const RenewFlightEndpointRequest = new RenewFlightEndpointRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Result$Type extends MessageType<Result> {
    constructor() {
        super("arrow.flight.protocol.Result", [
            { no: 1, name: "body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.Result
 */
export const Result = new Result$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CancelFlightInfoResult$Type extends MessageType<CancelFlightInfoResult> {
    constructor() {
        super("arrow.flight.protocol.CancelFlightInfoResult", [
            { no: 1, name: "status", kind: "enum", T: () => ["arrow.flight.protocol.CancelStatus", CancelStatus, "CANCEL_STATUS_"] }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.CancelFlightInfoResult
 */
export const CancelFlightInfoResult = new CancelFlightInfoResult$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SchemaResult$Type extends MessageType<SchemaResult> {
    constructor() {
        super("arrow.flight.protocol.SchemaResult", [
            { no: 1, name: "schema", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.SchemaResult
 */
export const SchemaResult = new SchemaResult$Type();
// @generated message type with reflection information, may provide speed optimized methods
class FlightDescriptor$Type extends MessageType<FlightDescriptor> {
    constructor() {
        super("arrow.flight.protocol.FlightDescriptor", [
            { no: 1, name: "type", kind: "enum", T: () => ["arrow.flight.protocol.FlightDescriptor.DescriptorType", FlightDescriptor_DescriptorType] },
            { no: 2, name: "cmd", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "path", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.FlightDescriptor
 */
export const FlightDescriptor = new FlightDescriptor$Type();
// @generated message type with reflection information, may provide speed optimized methods
class FlightInfo$Type extends MessageType<FlightInfo> {
    constructor() {
        super("arrow.flight.protocol.FlightInfo", [
            { no: 1, name: "schema", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "flight_descriptor", kind: "message", T: () => FlightDescriptor },
            { no: 3, name: "endpoint", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => FlightEndpoint },
            { no: 4, name: "total_records", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 5, name: "total_bytes", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 6, name: "ordered", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 7, name: "app_metadata", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.FlightInfo
 */
export const FlightInfo = new FlightInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PollInfo$Type extends MessageType<PollInfo> {
    constructor() {
        super("arrow.flight.protocol.PollInfo", [
            { no: 1, name: "info", kind: "message", T: () => FlightInfo },
            { no: 2, name: "flight_descriptor", kind: "message", T: () => FlightDescriptor },
            { no: 3, name: "progress", kind: "scalar", opt: true, T: 1 /*ScalarType.DOUBLE*/ },
            { no: 4, name: "expiration_time", kind: "message", T: () => Timestamp }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.PollInfo
 */
export const PollInfo = new PollInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
class FlightEndpoint$Type extends MessageType<FlightEndpoint> {
    constructor() {
        super("arrow.flight.protocol.FlightEndpoint", [
            { no: 1, name: "ticket", kind: "message", T: () => Ticket },
            { no: 2, name: "location", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Location },
            { no: 3, name: "expiration_time", kind: "message", T: () => Timestamp },
            { no: 4, name: "app_metadata", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.FlightEndpoint
 */
export const FlightEndpoint = new FlightEndpoint$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Location$Type extends MessageType<Location> {
    constructor() {
        super("arrow.flight.protocol.Location", [
            { no: 1, name: "uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.Location
 */
export const Location = new Location$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Ticket$Type extends MessageType<Ticket> {
    constructor() {
        super("arrow.flight.protocol.Ticket", [
            { no: 1, name: "ticket", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.Ticket
 */
export const Ticket = new Ticket$Type();
// @generated message type with reflection information, may provide speed optimized methods
class FlightData$Type extends MessageType<FlightData> {
    constructor() {
        super("arrow.flight.protocol.FlightData", [
            { no: 1, name: "flight_descriptor", kind: "message", T: () => FlightDescriptor },
            { no: 2, name: "data_header", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "app_metadata", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 1000, name: "data_body", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.FlightData
 */
export const FlightData = new FlightData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PutResult$Type extends MessageType<PutResult> {
    constructor() {
        super("arrow.flight.protocol.PutResult", [
            { no: 1, name: "app_metadata", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message arrow.flight.protocol.PutResult
 */
export const PutResult = new PutResult$Type();
/**
 * @generated ServiceType for protobuf service arrow.flight.protocol.FlightService
 */
export const FlightService = new ServiceType("arrow.flight.protocol.FlightService", [
    { name: "Handshake", serverStreaming: true, clientStreaming: true, options: {}, I: HandshakeRequest, O: HandshakeResponse },
    { name: "ListFlights", serverStreaming: true, options: {}, I: Criteria, O: FlightInfo },
    { name: "GetFlightInfo", options: {}, I: FlightDescriptor, O: FlightInfo },
    { name: "PollFlightInfo", options: {}, I: FlightDescriptor, O: PollInfo },
    { name: "GetSchema", options: {}, I: FlightDescriptor, O: SchemaResult },
    { name: "DoGet", serverStreaming: true, options: {}, I: Ticket, O: FlightData },
    { name: "DoPut", serverStreaming: true, clientStreaming: true, options: {}, I: FlightData, O: PutResult },
    { name: "DoExchange", serverStreaming: true, clientStreaming: true, options: {}, I: FlightData, O: FlightData },
    { name: "DoAction", serverStreaming: true, options: {}, I: Action, O: Result },
    { name: "ListActions", serverStreaming: true, options: {}, I: Empty, O: ActionType }
]);
