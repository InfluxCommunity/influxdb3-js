[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / FlightInfo

# Interface: FlightInfo

The access coordinates for retrieval of a dataset. With a FlightInfo, a
consumer is able to determine how to retrieve a dataset.

## Generated

from protobuf message arrow.flight.protocol.FlightInfo

## Properties

### appMetadata

> **appMetadata**: `Uint8Array`\<`ArrayBufferLike`\>

Application-defined metadata.

There is no inherent or required relationship between this
and the app_metadata fields in the FlightEndpoints or resulting
FlightData messages. Since this metadata is application-defined,
a given application could define there to be a relationship,
but there is none required by the spec.

#### Generated

from protobuf field: bytes app_metadata = 7;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:344](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L344)

***

### endpoint

> **endpoint**: [`FlightEndpoint`](FlightEndpoint.md)[]

A list of endpoints associated with the flight. To consume the
whole flight, all endpoints (and hence all Tickets) must be
consumed. Endpoints can be consumed in any order.

In other words, an application can use multiple endpoints to
represent partitioned data.

If the returned data has an ordering, an application can use
"FlightInfo.ordered = true" or should return the all data in a
single endpoint. Otherwise, there is no ordering defined on
endpoints or the data within.

A client can read ordered data by reading data from returned
endpoints, in order, from front to back.

Note that a client may ignore "FlightInfo.ordered = true". If an
ordering is important for an application, an application must
choose one of them:

* An application requires that all clients must read data in
  returned endpoints order.
* An application must return the all data in a single endpoint.

#### Generated

from protobuf field: repeated arrow.flight.protocol.FlightEndpoint endpoint = 3;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:314](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L314)

***

### flightDescriptor?

> `optional` **flightDescriptor**: [`FlightDescriptor`](FlightDescriptor.md)

The descriptor associated with this info.

#### Generated

from protobuf field: arrow.flight.protocol.FlightDescriptor flight_descriptor = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:286](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L286)

***

### ordered

> **ordered**: `boolean`

FlightEndpoints are in the same order as the data.

#### Generated

from protobuf field: bool ordered = 6;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:331](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L331)

***

### schema

> **schema**: `Uint8Array`\<`ArrayBufferLike`\>

The schema of the dataset in its IPC form:
  4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
  4 bytes - the byte length of the payload
  a flatbuffer Message whose header is the Schema

#### Generated

from protobuf field: bytes schema = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:279](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L279)

***

### totalBytes

> **totalBytes**: `bigint`

#### Generated

from protobuf field: int64 total_bytes = 5;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:324](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L324)

***

### totalRecords

> **totalRecords**: `bigint`

Set these to -1 if unknown.

#### Generated

from protobuf field: int64 total_records = 4;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:320](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L320)
