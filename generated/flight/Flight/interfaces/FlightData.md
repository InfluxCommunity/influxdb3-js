[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / FlightData

# Interface: FlightData

A batch of Arrow data as part of a stream of batches.

## Generated

from protobuf message arrow.flight.protocol.FlightData

## Properties

### appMetadata

> **appMetadata**: `Uint8Array`\<`ArrayBufferLike`\>

Application-defined metadata.

#### Generated

from protobuf field: bytes app_metadata = 3;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:515](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L515)

***

### dataBody

> **dataBody**: `Uint8Array`\<`ArrayBufferLike`\>

The actual batch of Arrow data. Preferably handled with minimal-copies
coming last in the definition to help with sidecar patterns (it is
expected that some implementations will fetch this field off the wire
with specialized code to avoid extra memory copies).

#### Generated

from protobuf field: bytes data_body = 1000;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:525](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L525)

***

### dataHeader

> **dataHeader**: `Uint8Array`\<`ArrayBufferLike`\>

Header for message data as described in Message.fbs::Message.

#### Generated

from protobuf field: bytes data_header = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:508](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L508)

***

### flightDescriptor?

> `optional` **flightDescriptor**: [`FlightDescriptor`](FlightDescriptor.md)

The descriptor of the data. This is only relevant when a client is
starting a new DoPut stream.

#### Generated

from protobuf field: arrow.flight.protocol.FlightDescriptor flight_descriptor = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:501](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L501)
