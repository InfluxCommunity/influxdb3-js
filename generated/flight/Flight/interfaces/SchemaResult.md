[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / SchemaResult

# Interface: SchemaResult

Wrap the result of a getSchema call

## Generated

from protobuf message arrow.flight.protocol.SchemaResult

## Properties

### schema

> **schema**: `Uint8Array`\<`ArrayBufferLike`\>

The schema of the dataset in its IPC form:
  4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
  4 bytes - the byte length of the payload
  a flatbuffer Message whose header is the Schema

#### Generated

from protobuf field: bytes schema = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:202](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L202)
