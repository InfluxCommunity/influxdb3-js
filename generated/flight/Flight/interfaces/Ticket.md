[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / Ticket

# Interface: Ticket

An opaque identifier that the service can use to retrieve a particular
portion of a stream.

Tickets are meant to be single use. It is an error/application-defined
behavior to reuse a ticket.

## Generated

from protobuf message arrow.flight.protocol.Ticket

## Properties

### ticket

> **ticket**: `Uint8Array`\<`ArrayBufferLike`\>

#### Generated

from protobuf field: bytes ticket = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:485](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L485)
