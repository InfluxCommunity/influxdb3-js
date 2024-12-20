[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / FlightDescriptor\_DescriptorType

# Enumeration: FlightDescriptor\_DescriptorType

Describes what type of descriptor is defined.

## Generated

from protobuf enum arrow.flight.protocol.FlightDescriptor.DescriptorType

## Enumeration Members

### CMD

> **CMD**: `2`

An opaque command to generate a dataset.

#### Generated

from protobuf enum value: CMD = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:261](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L261)

***

### PATH

> **PATH**: `1`

A named path that identifies a dataset. A path is composed of a string
or list of strings describing a particular dataset. This is conceptually
 similar to a path inside a filesystem.

#### Generated

from protobuf enum value: PATH = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:254](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L254)

***

### UNKNOWN

> **UNKNOWN**: `0`

Protobuf pattern, not used.

#### Generated

from protobuf enum value: UNKNOWN = 0;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:245](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L245)
