[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / FlightEndpoint

# Interface: FlightEndpoint

A particular stream or split associated with a flight.

## Generated

from protobuf message arrow.flight.protocol.FlightEndpoint

## Properties

### appMetadata

> **appMetadata**: `Uint8Array`\<`ArrayBufferLike`\>

Application-defined metadata.

There is no inherent or required relationship between this
and the app_metadata fields in the FlightInfo or resulting
FlightData messages. Since this metadata is application-defined,
a given application could define there to be a relationship,
but there is none required by the spec.

#### Generated

from protobuf field: bytes app_metadata = 4;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:456](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L456)

***

### expirationTime?

> `optional` **expirationTime**: [`Timestamp`](../../google/protobuf/timestamp/interfaces/Timestamp.md)

Expiration time of this stream. If present, clients may assume
they can retry DoGet requests. Otherwise, it is
application-defined whether DoGet requests may be retried.

#### Generated

from protobuf field: google.protobuf.Timestamp expiration_time = 3;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:443](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L443)

***

### location

> **location**: [`Location`](Location.md)[]

A list of URIs where this ticket can be redeemed via DoGet().

If the list is empty, the expectation is that the ticket can only
be redeemed on the current service where the ticket was
generated.

If the list is not empty, the expectation is that the ticket can
be redeemed at any of the locations, and that the data returned
will be equivalent. In this case, the ticket may only be redeemed
at one of the given locations, and not (necessarily) on the
current service.

In other words, an application can use multiple locations to
represent redundant and/or load balanced services.

#### Generated

from protobuf field: repeated arrow.flight.protocol.Location location = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:434](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L434)

***

### ticket?

> `optional` **ticket**: [`Ticket`](Ticket.md)

Token used to retrieve this stream.

#### Generated

from protobuf field: arrow.flight.protocol.Ticket ticket = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:414](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L414)
