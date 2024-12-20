[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [impl/QueryApiImpl](../index.md) / default

# Class: default

Asynchronous API that queries data from a database.

## Implements

- [`default`](../../../QueryApi/interfaces/default.md)

## Constructors

### new default()

> **new default**(`_options`): [`default`](default.md)

#### Parameters

##### \_options

[`ConnectionOptions`](../../../options/interfaces/ConnectionOptions.md)

#### Returns

[`default`](default.md)

#### Defined in

[packages/client/src/impl/QueryApiImpl.ts:27](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/QueryApiImpl.ts#L27)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`default`](../../../QueryApi/interfaces/default.md).[`close`](../../../QueryApi/interfaces/default.md#close)

#### Defined in

[packages/client/src/impl/QueryApiImpl.ts:181](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/QueryApiImpl.ts#L181)

***

### prepareMetadata()

> **prepareMetadata**(`headers`?): `RpcMetadata`

#### Parameters

##### headers?

`Record`\<`string`, `string`\>

#### Returns

`RpcMetadata`

#### Defined in

[packages/client/src/impl/QueryApiImpl.ts:60](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/QueryApiImpl.ts#L60)

***

### prepareTicket()

> **prepareTicket**(`database`, `query`, `options`): [`Ticket`](../../../generated/flight/Flight/interfaces/Ticket.md)

#### Parameters

##### database

`string`

##### query

`string`

##### options

[`QueryOptions`](../../../options/interfaces/QueryOptions.md)

#### Returns

[`Ticket`](../../../generated/flight/Flight/interfaces/Ticket.md)

#### Defined in

[packages/client/src/impl/QueryApiImpl.ts:34](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/QueryApiImpl.ts#L34)

***

### query()

> **query**(`query`, `database`, `options`): `AsyncGenerator`\<`Record`\<`string`, `any`\>, `void`, `void`\>

Execute a query and return the results as an async generator.

#### Parameters

##### query

`string`

The query string.

##### database

`string`

The name of the database to query.

##### options

[`QueryOptions`](../../../options/interfaces/QueryOptions.md)

options applied to the query (default: { type: 'sql'}).

#### Returns

`AsyncGenerator`\<`Record`\<`string`, `any`\>, `void`, `void`\>

An async generator that yields maps of string keys to any values.

#### Implementation of

[`default`](../../../QueryApi/interfaces/default.md).[`query`](../../../QueryApi/interfaces/default.md#query)

#### Defined in

[packages/client/src/impl/QueryApiImpl.ts:109](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/QueryApiImpl.ts#L109)

***

### queryPoints()

> **queryPoints**(`query`, `database`, `options`): `AsyncGenerator`\<[`PointValues`](../../../PointValues/classes/PointValues.md), `void`, `void`\>

Execute a query and return the results as an async generator.

#### Parameters

##### query

`string`

The query string.

##### database

`string`

The name of the database to query.

##### options

[`QueryOptions`](../../../options/interfaces/QueryOptions.md)

Options for the query (default: {type: 'sql'}).

#### Returns

`AsyncGenerator`\<[`PointValues`](../../../PointValues/classes/PointValues.md), `void`, `void`\>

An async generator that yields PointValues object.

#### Implementation of

[`default`](../../../QueryApi/interfaces/default.md).[`queryPoints`](../../../QueryApi/interfaces/default.md#querypoints)

#### Defined in

[packages/client/src/impl/QueryApiImpl.ts:127](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/QueryApiImpl.ts#L127)
