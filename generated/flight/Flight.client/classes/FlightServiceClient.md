[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight.client](../index.md) / FlightServiceClient

# Class: FlightServiceClient

A flight service is an endpoint for retrieving or storing Arrow data. A
flight service can expose one or more predefined endpoints that can be
accessed using the Arrow Flight Protocol. Additionally, a flight service
can expose a set of actions that are available.

## Generated

from protobuf service arrow.flight.protocol.FlightService

## Implements

- [`IFlightServiceClient`](../interfaces/IFlightServiceClient.md)
- `ServiceInfo`

## Constructors

### new FlightServiceClient()

> **new FlightServiceClient**(`_transport`): [`FlightServiceClient`](FlightServiceClient.md)

#### Parameters

##### \_transport

`RpcTransport`

#### Returns

[`FlightServiceClient`](FlightServiceClient.md)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:198](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L198)

## Properties

### methods

> **methods**: `MethodInfo`\<`any`, `any`\>[] = `FlightService.methods`

Information for each rpc method of the service, in the order of
declaration in the source .proto.

#### Implementation of

`ServiceInfo.methods`

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:196](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L196)

***

### options

> **options**: `JsonOptionsMap` = `FlightService.options`

Contains custom service options from the .proto source in JSON format.

#### Implementation of

`ServiceInfo.options`

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:197](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L197)

***

### typeName

> **typeName**: `string` = `FlightService.typeName`

The protobuf type name of the service, including package name if
present.

#### Implementation of

`ServiceInfo.typeName`

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:195](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L195)

## Methods

### doAction()

> **doAction**(`input`, `options`?): `ServerStreamingCall`\<[`Action`](../../Flight/interfaces/Action.md), [`Result`](../../Flight/interfaces/Result.md)\>

Flight services can support an arbitrary number of simple actions in
addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
operations that are potentially available. DoAction allows a flight client
to do a specific action against a flight service. An action includes
opaque request and response objects that are specific to the type action
being undertaken.

#### Parameters

##### input

[`Action`](../../Flight/interfaces/Action.md)

##### options?

`RpcOptions`

#### Returns

`ServerStreamingCall`\<[`Action`](../../Flight/interfaces/Action.md), [`Result`](../../Flight/interfaces/Result.md)\>

#### Generated

from protobuf rpc: DoAction(arrow.flight.protocol.Action) returns (stream arrow.flight.protocol.Result);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`doAction`](../interfaces/IFlightServiceClient.md#doaction)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:344](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L344)

***

### doExchange()

> **doExchange**(`options`?): `DuplexStreamingCall`\<[`FlightData`](../../Flight/interfaces/FlightData.md), [`FlightData`](../../Flight/interfaces/FlightData.md)\>

Open a bidirectional data channel for a given descriptor. This
allows clients to send and receive arbitrary Arrow data and
application-specific metadata in a single logical stream. In
contrast to DoGet/DoPut, this is more suited for clients
offloading computation (rather than storage) to a Flight service.

#### Parameters

##### options?

`RpcOptions`

#### Returns

`DuplexStreamingCall`\<[`FlightData`](../../Flight/interfaces/FlightData.md), [`FlightData`](../../Flight/interfaces/FlightData.md)\>

#### Generated

from protobuf rpc: DoExchange(stream arrow.flight.protocol.FlightData) returns (stream arrow.flight.protocol.FlightData);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`doExchange`](../interfaces/IFlightServiceClient.md#doexchange)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:329](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L329)

***

### doGet()

> **doGet**(`input`, `options`?): `ServerStreamingCall`\<[`Ticket`](../../Flight/interfaces/Ticket.md), [`FlightData`](../../Flight/interfaces/FlightData.md)\>

Retrieve a single stream associated with a particular descriptor
associated with the referenced ticket. A Flight can be composed of one or
more streams where each stream can be retrieved using a separate opaque
ticket that the flight service uses for managing a collection of streams.

#### Parameters

##### input

[`Ticket`](../../Flight/interfaces/Ticket.md)

##### options?

`RpcOptions`

#### Returns

`ServerStreamingCall`\<[`Ticket`](../../Flight/interfaces/Ticket.md), [`FlightData`](../../Flight/interfaces/FlightData.md)\>

#### Generated

from protobuf rpc: DoGet(arrow.flight.protocol.Ticket) returns (stream arrow.flight.protocol.FlightData);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`doGet`](../interfaces/IFlightServiceClient.md#doget)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:300](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L300)

***

### doPut()

> **doPut**(`options`?): `DuplexStreamingCall`\<[`FlightData`](../../Flight/interfaces/FlightData.md), [`PutResult`](../../Flight/interfaces/PutResult.md)\>

Push a stream to the flight service associated with a particular
flight stream. This allows a client of a flight service to upload a stream
of data. Depending on the particular flight service, a client consumer
could be allowed to upload a single stream per descriptor or an unlimited
number. In the latter, the service might implement a 'seal' action that
can be applied to a descriptor once all streams are uploaded.

#### Parameters

##### options?

`RpcOptions`

#### Returns

`DuplexStreamingCall`\<[`FlightData`](../../Flight/interfaces/FlightData.md), [`PutResult`](../../Flight/interfaces/PutResult.md)\>

#### Generated

from protobuf rpc: DoPut(stream arrow.flight.protocol.FlightData) returns (stream arrow.flight.protocol.PutResult);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`doPut`](../interfaces/IFlightServiceClient.md#doput)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:315](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L315)

***

### getFlightInfo()

> **getFlightInfo**(`input`, `options`?): `UnaryCall`\<[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md), [`FlightInfo`](../../Flight/interfaces/FlightInfo.md)\>

For a given FlightDescriptor, get information about how the flight can be
consumed. This is a useful interface if the consumer of the interface
already can identify the specific flight to consume. This interface can
also allow a consumer to generate a flight stream through a specified
descriptor. For example, a flight descriptor might be something that
includes a SQL statement or a Pickled Python operation that will be
executed. In those cases, the descriptor will not be previously available
within the list of available streams provided by ListFlights but will be
available for consumption for the duration defined by the specific flight
service.

#### Parameters

##### input

[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md)

##### options?

`RpcOptions`

#### Returns

`UnaryCall`\<[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md), [`FlightInfo`](../../Flight/interfaces/FlightInfo.md)\>

#### Generated

from protobuf rpc: GetFlightInfo(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.FlightInfo);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`getFlightInfo`](../interfaces/IFlightServiceClient.md#getflightinfo)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:243](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L243)

***

### getSchema()

> **getSchema**(`input`, `options`?): `UnaryCall`\<[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md), [`SchemaResult`](../../Flight/interfaces/SchemaResult.md)\>

For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
This is used when a consumer needs the Schema of flight stream. Similar to
GetFlightInfo this interface may generate a new flight that was not previously
available in ListFlights.

#### Parameters

##### input

[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md)

##### options?

`RpcOptions`

#### Returns

`UnaryCall`\<[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md), [`SchemaResult`](../../Flight/interfaces/SchemaResult.md)\>

#### Generated

from protobuf rpc: GetSchema(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.SchemaResult);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`getSchema`](../interfaces/IFlightServiceClient.md#getschema)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:287](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L287)

***

### handshake()

> **handshake**(`options`?): `DuplexStreamingCall`\<[`HandshakeRequest`](../../Flight/interfaces/HandshakeRequest.md), [`HandshakeResponse`](../../Flight/interfaces/HandshakeResponse.md)\>

Handshake between client and server. Depending on the server, the
handshake may be required to determine the token that should be used for
future operations. Both request and response are streams to allow multiple
round-trips depending on auth mechanism.

#### Parameters

##### options?

`RpcOptions`

#### Returns

`DuplexStreamingCall`\<[`HandshakeRequest`](../../Flight/interfaces/HandshakeRequest.md), [`HandshakeResponse`](../../Flight/interfaces/HandshakeResponse.md)\>

#### Generated

from protobuf rpc: Handshake(stream arrow.flight.protocol.HandshakeRequest) returns (stream arrow.flight.protocol.HandshakeResponse);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`handshake`](../interfaces/IFlightServiceClient.md#handshake)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:209](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L209)

***

### listActions()

> **listActions**(`input`, `options`?): `ServerStreamingCall`\<[`Empty`](../../Flight/interfaces/Empty.md), [`ActionType`](../../Flight/interfaces/ActionType.md)\>

A flight service exposes all of the available action types that it has
along with descriptions. This allows different flight consumers to
understand the capabilities of the flight service.

#### Parameters

##### input

[`Empty`](../../Flight/interfaces/Empty.md)

##### options?

`RpcOptions`

#### Returns

`ServerStreamingCall`\<[`Empty`](../../Flight/interfaces/Empty.md), [`ActionType`](../../Flight/interfaces/ActionType.md)\>

#### Generated

from protobuf rpc: ListActions(arrow.flight.protocol.Empty) returns (stream arrow.flight.protocol.ActionType);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`listActions`](../interfaces/IFlightServiceClient.md#listactions)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:356](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L356)

***

### listFlights()

> **listFlights**(`input`, `options`?): `ServerStreamingCall`\<[`Criteria`](../../Flight/interfaces/Criteria.md), [`FlightInfo`](../../Flight/interfaces/FlightInfo.md)\>

Get a list of available streams given a particular criteria. Most flight
services will expose one or more streams that are readily available for
retrieval. This api allows listing the streams available for
consumption. A user can also provide a criteria. The criteria can limit
the subset of streams that can be listed via this interface. Each flight
service allows its own definition of how to consume criteria.

#### Parameters

##### input

[`Criteria`](../../Flight/interfaces/Criteria.md)

##### options?

`RpcOptions`

#### Returns

`ServerStreamingCall`\<[`Criteria`](../../Flight/interfaces/Criteria.md), [`FlightInfo`](../../Flight/interfaces/FlightInfo.md)\>

#### Generated

from protobuf rpc: ListFlights(arrow.flight.protocol.Criteria) returns (stream arrow.flight.protocol.FlightInfo);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`listFlights`](../interfaces/IFlightServiceClient.md#listflights)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:224](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L224)

***

### pollFlightInfo()

> **pollFlightInfo**(`input`, `options`?): `UnaryCall`\<[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md), [`PollInfo`](../../Flight/interfaces/PollInfo.md)\>

For a given FlightDescriptor, start a query and get information
to poll its execution status. This is a useful interface if the
query may be a long-running query. The first PollFlightInfo call
should return as quickly as possible. (GetFlightInfo doesn't
return until the query is complete.)

A client can consume any available results before
the query is completed. See PollInfo.info for details.

A client can poll the updated query status by calling
PollFlightInfo() with PollInfo.flight_descriptor. A server
should not respond until the result would be different from last
time. That way, the client can "long poll" for updates
without constantly making requests. Clients can set a short timeout
to avoid blocking calls if desired.

A client can't use PollInfo.flight_descriptor after
PollInfo.expiration_time passes. A server might not accept the
retry descriptor anymore and the query may be cancelled.

A client may use the CancelFlightInfo action with
PollInfo.info to cancel the running query.

#### Parameters

##### input

[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md)

##### options?

`RpcOptions`

#### Returns

`UnaryCall`\<[`FlightDescriptor`](../../Flight/interfaces/FlightDescriptor.md), [`PollInfo`](../../Flight/interfaces/PollInfo.md)\>

#### Generated

from protobuf rpc: PollFlightInfo(arrow.flight.protocol.FlightDescriptor) returns (arrow.flight.protocol.PollInfo);

#### Implementation of

[`IFlightServiceClient`](../interfaces/IFlightServiceClient.md).[`pollFlightInfo`](../interfaces/IFlightServiceClient.md#pollflightinfo)

#### Defined in

[packages/client/src/generated/flight/Flight.client.ts:274](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.client.ts#L274)
