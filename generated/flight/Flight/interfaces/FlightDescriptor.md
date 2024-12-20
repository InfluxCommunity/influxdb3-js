[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / FlightDescriptor

# Interface: FlightDescriptor

The name or tag for a Flight. May be used as a way to retrieve or generate
a flight or be used to expose a set of previously defined flights.

## Generated

from protobuf message arrow.flight.protocol.FlightDescriptor

## Properties

### cmd

> **cmd**: `Uint8Array`\<`ArrayBufferLike`\>

Opaque value used to express a command. Should only be defined when
type = CMD.

#### Generated

from protobuf field: bytes cmd = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:223](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L223)

***

### path

> **path**: `string`[]

List of strings identifying a particular dataset. Should only be defined
when type = PATH.

#### Generated

from protobuf field: repeated string path = 3;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:231](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L231)

***

### type

> **type**: [`FlightDescriptor_DescriptorType`](../enumerations/FlightDescriptor_DescriptorType.md)

#### Generated

from protobuf field: arrow.flight.protocol.FlightDescriptor.DescriptorType type = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:215](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L215)
