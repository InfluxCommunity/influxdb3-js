[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / HandshakeRequest

# Interface: HandshakeRequest

The request that a client provides to a server on handshake.

## Generated

from protobuf message arrow.flight.protocol.HandshakeRequest

## Properties

### payload

> **payload**: `Uint8Array`\<`ArrayBufferLike`\>

Arbitrary auth/handshake info.

#### Generated

from protobuf field: bytes payload = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:45](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L45)

***

### protocolVersion

> **protocolVersion**: `bigint`

A defined protocol version

#### Generated

from protobuf field: uint64 protocol_version = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:38](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L38)