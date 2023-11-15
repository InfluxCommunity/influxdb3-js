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
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { FlightService } from "./Flight";
import type { ActionType } from "./Flight";
import type { Empty } from "./Flight";
import type { Result } from "./Flight";
import type { Action } from "./Flight";
import type { PutResult } from "./Flight";
import type { FlightData } from "./Flight";
import type { Ticket } from "./Flight";
import type { SchemaResult } from "./Flight";
import type { PollInfo } from "./Flight";
import type { FlightDescriptor } from "./Flight";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { FlightInfo } from "./Flight";
import type { Criteria } from "./Flight";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { HandshakeResponse } from "./Flight";
import type { HandshakeRequest } from "./Flight";
import type { DuplexStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 *
 * A flight service is an endpoint for retrieving or storing Arrow data. A
 * flight service can expose one or more predefined endpoints that can be
 * accessed using the Arrow Flight Protocol. Additionally, a flight service
 * can expose a set of actions that are available.
 *
 * @generated from protobuf service arrow.flight.protocol.FlightService
 */
export interface IFlightServiceClient {
    /**
     *
     * Handshake between client and server. Depending on the server, the
     * handshake may be required to determine the token that should be used for
     * future operations. Both request and response are streams to allow multiple
     * round-trips depending on auth mechanism.
     *
     * @generated from protobuf rpc: Handshake(stream arrow.flight.protocol.HandshakeRequest) returns (stream arrow.flight.protocol.HandshakeResponse);
     */
    handshake(options?: RpcOptions): DuplexStreamingCall<HandshakeRequest, HandshakeResponse>;
    /**
     *
     * Get a list of available streams given a particular criteria. Most flight
     * services will expose one or more streams that are readily available for
     * retrieval. This api allows listing the streams available for
     * consumption. A user can also provide a criteria. The criteria can limit
     * the subset of streams that can be listed via this interface. Each flight
     * service allows its own definition of how to consume criteria.
     *
     * @generated from protobuf rpc: ListFlights(arrow.flight.protocol.Criteria) returns (stream arrow.flight.protocol.FlightInfo);
     */
    listFlights(input: Criteria, options?: RpcOptions): ServerStreamingCall<Criteria, FlightInfo>;
    /**
     *
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
     *
     * @generated from protobuf rpc: GetFlightInfo(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.FlightInfo);
     */
    getFlightInfo(input: FlightDescriptor, options?: RpcOptions): UnaryCall<FlightDescriptor, FlightInfo>;
    /**
     *
     * For a given FlightDescriptor, start a query and get information
     * to poll its execution status. This is a useful interface if the
     * query may be a long-running query. The first PollFlightInfo call
     * should return as quickly as possible. (GetFlightInfo doesn't
     * return until the query is complete.)
     *
     * A client can consume any available results before
     * the query is completed. See PollInfo.info for details.
     *
     * A client can poll the updated query status by calling
     * PollFlightInfo() with PollInfo.flight_descriptor. A server
     * should not respond until the result would be different from last
     * time. That way, the client can "long poll" for updates
     * without constantly making requests. Clients can set a short timeout
     * to avoid blocking calls if desired.
     *
     * A client can't use PollInfo.flight_descriptor after
     * PollInfo.expiration_time passes. A server might not accept the
     * retry descriptor anymore and the query may be cancelled.
     *
     * A client may use the CancelFlightInfo action with
     * PollInfo.info to cancel the running query.
     *
     * @generated from protobuf rpc: PollFlightInfo(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.PollInfo);
     */
    pollFlightInfo(input: FlightDescriptor, options?: RpcOptions): UnaryCall<FlightDescriptor, PollInfo>;
    /**
     *
     * For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
     * This is used when a consumer needs the Schema of flight stream. Similar to
     * GetFlightInfo this interface may generate a new flight that was not previously
     * available in ListFlights.
     *
     * @generated from protobuf rpc: GetSchema(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.SchemaResult);
     */
    getSchema(input: FlightDescriptor, options?: RpcOptions): UnaryCall<FlightDescriptor, SchemaResult>;
    /**
     *
     * Retrieve a single stream associated with a particular descriptor
     * associated with the referenced ticket. A Flight can be composed of one or
     * more streams where each stream can be retrieved using a separate opaque
     * ticket that the flight service uses for managing a collection of streams.
     *
     * @generated from protobuf rpc: DoGet(arrow.flight.protocol.Ticket) returns (stream arrow.flight.protocol.FlightData);
     */
    doGet(input: Ticket, options?: RpcOptions): ServerStreamingCall<Ticket, FlightData>;
    /**
     *
     * Push a stream to the flight service associated with a particular
     * flight stream. This allows a client of a flight service to upload a stream
     * of data. Depending on the particular flight service, a client consumer
     * could be allowed to upload a single stream per descriptor or an unlimited
     * number. In the latter, the service might implement a 'seal' action that
     * can be applied to a descriptor once all streams are uploaded.
     *
     * @generated from protobuf rpc: DoPut(stream arrow.flight.protocol.FlightData) returns (stream arrow.flight.protocol.PutResult);
     */
    doPut(options?: RpcOptions): DuplexStreamingCall<FlightData, PutResult>;
    /**
     *
     * Open a bidirectional data channel for a given descriptor. This
     * allows clients to send and receive arbitrary Arrow data and
     * application-specific metadata in a single logical stream. In
     * contrast to DoGet/DoPut, this is more suited for clients
     * offloading computation (rather than storage) to a Flight service.
     *
     * @generated from protobuf rpc: DoExchange(stream arrow.flight.protocol.FlightData) returns (stream arrow.flight.protocol.FlightData);
     */
    doExchange(options?: RpcOptions): DuplexStreamingCall<FlightData, FlightData>;
    /**
     *
     * Flight services can support an arbitrary number of simple actions in
     * addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
     * operations that are potentially available. DoAction allows a flight client
     * to do a specific action against a flight service. An action includes
     * opaque request and response objects that are specific to the type action
     * being undertaken.
     *
     * @generated from protobuf rpc: DoAction(arrow.flight.protocol.Action) returns (stream arrow.flight.protocol.Result);
     */
    doAction(input: Action, options?: RpcOptions): ServerStreamingCall<Action, Result>;
    /**
     *
     * A flight service exposes all of the available action types that it has
     * along with descriptions. This allows different flight consumers to
     * understand the capabilities of the flight service.
     *
     * @generated from protobuf rpc: ListActions(arrow.flight.protocol.Empty) returns (stream arrow.flight.protocol.ActionType);
     */
    listActions(input: Empty, options?: RpcOptions): ServerStreamingCall<Empty, ActionType>;
}
/**
 *
 * A flight service is an endpoint for retrieving or storing Arrow data. A
 * flight service can expose one or more predefined endpoints that can be
 * accessed using the Arrow Flight Protocol. Additionally, a flight service
 * can expose a set of actions that are available.
 *
 * @generated from protobuf service arrow.flight.protocol.FlightService
 */
export class FlightServiceClient implements IFlightServiceClient, ServiceInfo {
    typeName = FlightService.typeName;
    methods = FlightService.methods;
    options = FlightService.options;
    constructor(private readonly _transport: RpcTransport) {
    }
    /**
     *
     * Handshake between client and server. Depending on the server, the
     * handshake may be required to determine the token that should be used for
     * future operations. Both request and response are streams to allow multiple
     * round-trips depending on auth mechanism.
     *
     * @generated from protobuf rpc: Handshake(stream arrow.flight.protocol.HandshakeRequest) returns (stream arrow.flight.protocol.HandshakeResponse);
     */
    handshake(options?: RpcOptions): DuplexStreamingCall<HandshakeRequest, HandshakeResponse> {
        const method = this.methods[0], opt = this._transport.mergeOptions(options);
        return stackIntercept<HandshakeRequest, HandshakeResponse>("duplex", this._transport, method, opt);
    }
    /**
     *
     * Get a list of available streams given a particular criteria. Most flight
     * services will expose one or more streams that are readily available for
     * retrieval. This api allows listing the streams available for
     * consumption. A user can also provide a criteria. The criteria can limit
     * the subset of streams that can be listed via this interface. Each flight
     * service allows its own definition of how to consume criteria.
     *
     * @generated from protobuf rpc: ListFlights(arrow.flight.protocol.Criteria) returns (stream arrow.flight.protocol.FlightInfo);
     */
    listFlights(input: Criteria, options?: RpcOptions): ServerStreamingCall<Criteria, FlightInfo> {
        const method = this.methods[1], opt = this._transport.mergeOptions(options);
        return stackIntercept<Criteria, FlightInfo>("serverStreaming", this._transport, method, opt, input);
    }
    /**
     *
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
     *
     * @generated from protobuf rpc: GetFlightInfo(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.FlightInfo);
     */
    getFlightInfo(input: FlightDescriptor, options?: RpcOptions): UnaryCall<FlightDescriptor, FlightInfo> {
        const method = this.methods[2], opt = this._transport.mergeOptions(options);
        return stackIntercept<FlightDescriptor, FlightInfo>("unary", this._transport, method, opt, input);
    }
    /**
     *
     * For a given FlightDescriptor, start a query and get information
     * to poll its execution status. This is a useful interface if the
     * query may be a long-running query. The first PollFlightInfo call
     * should return as quickly as possible. (GetFlightInfo doesn't
     * return until the query is complete.)
     *
     * A client can consume any available results before
     * the query is completed. See PollInfo.info for details.
     *
     * A client can poll the updated query status by calling
     * PollFlightInfo() with PollInfo.flight_descriptor. A server
     * should not respond until the result would be different from last
     * time. That way, the client can "long poll" for updates
     * without constantly making requests. Clients can set a short timeout
     * to avoid blocking calls if desired.
     *
     * A client can't use PollInfo.flight_descriptor after
     * PollInfo.expiration_time passes. A server might not accept the
     * retry descriptor anymore and the query may be cancelled.
     *
     * A client may use the CancelFlightInfo action with
     * PollInfo.info to cancel the running query.
     *
     * @generated from protobuf rpc: PollFlightInfo(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.PollInfo);
     */
    pollFlightInfo(input: FlightDescriptor, options?: RpcOptions): UnaryCall<FlightDescriptor, PollInfo> {
        const method = this.methods[3], opt = this._transport.mergeOptions(options);
        return stackIntercept<FlightDescriptor, PollInfo>("unary", this._transport, method, opt, input);
    }
    /**
     *
     * For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
     * This is used when a consumer needs the Schema of flight stream. Similar to
     * GetFlightInfo this interface may generate a new flight that was not previously
     * available in ListFlights.
     *
     * @generated from protobuf rpc: GetSchema(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.SchemaResult);
     */
    getSchema(input: FlightDescriptor, options?: RpcOptions): UnaryCall<FlightDescriptor, SchemaResult> {
        const method = this.methods[4], opt = this._transport.mergeOptions(options);
        return stackIntercept<FlightDescriptor, SchemaResult>("unary", this._transport, method, opt, input);
    }
    /**
     *
     * Retrieve a single stream associated with a particular descriptor
     * associated with the referenced ticket. A Flight can be composed of one or
     * more streams where each stream can be retrieved using a separate opaque
     * ticket that the flight service uses for managing a collection of streams.
     *
     * @generated from protobuf rpc: DoGet(arrow.flight.protocol.Ticket) returns (stream arrow.flight.protocol.FlightData);
     */
    doGet(input: Ticket, options?: RpcOptions): ServerStreamingCall<Ticket, FlightData> {
        const method = this.methods[5], opt = this._transport.mergeOptions(options);
        return stackIntercept<Ticket, FlightData>("serverStreaming", this._transport, method, opt, input);
    }
    /**
     *
     * Push a stream to the flight service associated with a particular
     * flight stream. This allows a client of a flight service to upload a stream
     * of data. Depending on the particular flight service, a client consumer
     * could be allowed to upload a single stream per descriptor or an unlimited
     * number. In the latter, the service might implement a 'seal' action that
     * can be applied to a descriptor once all streams are uploaded.
     *
     * @generated from protobuf rpc: DoPut(stream arrow.flight.protocol.FlightData) returns (stream arrow.flight.protocol.PutResult);
     */
    doPut(options?: RpcOptions): DuplexStreamingCall<FlightData, PutResult> {
        const method = this.methods[6], opt = this._transport.mergeOptions(options);
        return stackIntercept<FlightData, PutResult>("duplex", this._transport, method, opt);
    }
    /**
     *
     * Open a bidirectional data channel for a given descriptor. This
     * allows clients to send and receive arbitrary Arrow data and
     * application-specific metadata in a single logical stream. In
     * contrast to DoGet/DoPut, this is more suited for clients
     * offloading computation (rather than storage) to a Flight service.
     *
     * @generated from protobuf rpc: DoExchange(stream arrow.flight.protocol.FlightData) returns (stream arrow.flight.protocol.FlightData);
     */
    doExchange(options?: RpcOptions): DuplexStreamingCall<FlightData, FlightData> {
        const method = this.methods[7], opt = this._transport.mergeOptions(options);
        return stackIntercept<FlightData, FlightData>("duplex", this._transport, method, opt);
    }
    /**
     *
     * Flight services can support an arbitrary number of simple actions in
     * addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
     * operations that are potentially available. DoAction allows a flight client
     * to do a specific action against a flight service. An action includes
     * opaque request and response objects that are specific to the type action
     * being undertaken.
     *
     * @generated from protobuf rpc: DoAction(arrow.flight.protocol.Action) returns (stream arrow.flight.protocol.Result);
     */
    doAction(input: Action, options?: RpcOptions): ServerStreamingCall<Action, Result> {
        const method = this.methods[8], opt = this._transport.mergeOptions(options);
        return stackIntercept<Action, Result>("serverStreaming", this._transport, method, opt, input);
    }
    /**
     *
     * A flight service exposes all of the available action types that it has
     * along with descriptions. This allows different flight consumers to
     * understand the capabilities of the flight service.
     *
     * @generated from protobuf rpc: ListActions(arrow.flight.protocol.Empty) returns (stream arrow.flight.protocol.ActionType);
     */
    listActions(input: Empty, options?: RpcOptions): ServerStreamingCall<Empty, ActionType> {
        const method = this.methods[9], opt = this._transport.mergeOptions(options);
        return stackIntercept<Empty, ActionType>("serverStreaming", this._transport, method, opt, input);
    }
}
