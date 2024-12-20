[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [generated/flight/Flight](../index.md) / CancelStatus

# Enumeration: CancelStatus

The result of a cancel operation.

This is used by CancelFlightInfoResult.status.

## Generated

from protobuf enum arrow.flight.protocol.CancelStatus

## Enumeration Members

### CANCELLED

> **CANCELLED**: `1`

The cancellation request is complete. Subsequent requests with
the same payload may return CANCELLED or a NOT_FOUND error.

#### Generated

from protobuf enum value: CANCEL_STATUS_CANCELLED = 1;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:562](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L562)

***

### CANCELLING

> **CANCELLING**: `2`

The cancellation request is in progress. The client may retry
the cancellation request.

#### Generated

from protobuf enum value: CANCEL_STATUS_CANCELLING = 2;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:569](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L569)

***

### NOT\_CANCELLABLE

> **NOT\_CANCELLABLE**: `3`

The query is not cancellable. The client should not retry the
cancellation request.

#### Generated

from protobuf enum value: CANCEL_STATUS_NOT_CANCELLABLE = 3;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:576](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L576)

***

### UNSPECIFIED

> **UNSPECIFIED**: `0`

The cancellation status is unknown. Servers should avoid using
this value (send a NOT_FOUND error if the requested query is
not known). Clients can retry the request.

#### Generated

from protobuf enum value: CANCEL_STATUS_UNSPECIFIED = 0;

#### Defined in

[packages/client/src/generated/flight/Flight.ts:555](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/generated/flight/Flight.ts#L555)
