[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [QueryApi](../index.md) / default

# Interface: default

Asynchronous API that queries data from a database.

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/client/src/QueryApi.ts:38](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/QueryApi.ts#L38)

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

[`QueryOptions`](../../options/interfaces/QueryOptions.md)

options applied to the query (default: { type: 'sql'}).

#### Returns

`AsyncGenerator`\<`Record`\<`string`, `any`\>, `void`, `void`\>

An async generator that yields maps of string keys to any values.

#### Defined in

[packages/client/src/QueryApi.ts:18](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/QueryApi.ts#L18)

***

### queryPoints()

> **queryPoints**(`query`, `database`, `options`): `AsyncGenerator`\<[`PointValues`](../../PointValues/classes/PointValues.md), `void`, `void`\>

Execute a query and return the results as an async generator.

#### Parameters

##### query

`string`

The query string.

##### database

`string`

The name of the database to query.

##### options

[`QueryOptions`](../../options/interfaces/QueryOptions.md)

Options for the query (default: {type: 'sql'}).

#### Returns

`AsyncGenerator`\<[`PointValues`](../../PointValues/classes/PointValues.md), `void`, `void`\>

An async generator that yields PointValues object.

#### Defined in

[packages/client/src/QueryApi.ts:32](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/QueryApi.ts#L32)
