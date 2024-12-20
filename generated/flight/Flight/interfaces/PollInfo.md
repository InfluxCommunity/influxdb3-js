[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / PollInfo

# Interface: PollInfo

The information to process a long-running query.

## Generated

from protobuf message arrow.flight.protocol.PollInfo

## Properties

### expirationTime?

> `optional` **expirationTime**: [`Timestamp`](../../google/protobuf/timestamp/interfaces/Timestamp.md)

Expiration time for this request. After this passes, the server
might not accept the retry descriptor anymore (and the query may
be cancelled). This may be updated on a call to PollFlightInfo.

#### Generated

from protobuf field: google.protobuf.Timestamp expiration_time = 4;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:399](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L399)

***

### flightDescriptor?

> `optional` **flightDescriptor**: [`FlightDescriptor`](FlightDescriptor.md)

The descriptor the client should use on the next try.
If unset, the query is complete.

#### Generated

from protobuf field: arrow.flight.protocol.FlightDescriptor flight_descriptor = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:382](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L382)

***

### info?

> `optional` **info**: [`FlightInfo`](FlightInfo.md)

The currently available results.

If "flight_descriptor" is not specified, the query is complete
and "info" specifies all results. Otherwise, "info" contains
partial query results.

Note that each PollInfo response contains a complete
FlightInfo (not just the delta between the previous and current
FlightInfo).

Subsequent PollInfo responses may only append new endpoints to
info.

Clients can begin fetching results via DoGet(Ticket) with the
ticket in the info before the query is
completed. FlightInfo.ordered is also valid.

#### Generated

from protobuf field: arrow.flight.protocol.FlightInfo info = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:374](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L374)

***

### progress?

> `optional` **progress**: `number`

Query progress. If known, must be in [0.0, 1.0] but need not be
monotonic or nondecreasing. If unknown, do not set.

#### Generated

from protobuf field: optional double progress = 3;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:390](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L390)
