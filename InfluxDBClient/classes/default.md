[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [InfluxDBClient](../index.md) / default

# Class: default

`InfluxDBClient` for interacting with an InfluxDB server, simplifying common operations such as writing, querying.

## Constructors

### new default()

> **new default**(`options`): [`default`](default.md)

Creates a new instance of the `InfluxDBClient` from `ClientOptions`.

#### Parameters

##### options

[`ClientOptions`](../../options/interfaces/ClientOptions.md)

client options

#### Returns

[`default`](default.md)

#### Defined in

[packages/client/src/InfluxDBClient.ts:37](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L37)

### new default()

> **new default**(`connectionString`): [`default`](default.md)

Creates a new instance of the `InfluxDBClient` from connection string.

#### Parameters

##### connectionString

`string`

connection string

#### Returns

[`default`](default.md)

#### Example

```ts
https://us-east-1-1.aws.cloud2.influxdata.com/?token=my-token&database=my-database

Supported query parameters:
  - token - authentication token (required)
  - authScheme - token authentication scheme. Not set for Cloud access, set to 'Bearer' for Edge.
  - database - database (bucket) name
  - timeout - I/O timeout
  - precision - timestamp precision when writing data
  - gzipThreshold - payload size threshold for gzipping data
```

#### Defined in

[packages/client/src/InfluxDBClient.ts:53](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L53)

### new default()

> **new default**(): [`default`](default.md)

Creates a new instance of the `InfluxDBClient` from environment variables.

Supported variables:
  - INFLUX_HOST - cloud/server URL (required)
  - INFLUX_TOKEN - authentication token (required)
  - INFLUX_AUTH_SCHEME - token authentication scheme. Not set for Cloud access, set to 'Bearer' for Edge.
  - INFLUX_TIMEOUT - I/O timeout
  - INFLUX_DATABASE - database (bucket) name
  - INFLUX_PRECISION - timestamp precision when writing data
  - INFLUX_GZIP_THRESHOLD - payload size threshold for gzipping data

#### Returns

[`default`](default.md)

#### Defined in

[packages/client/src/InfluxDBClient.ts:67](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L67)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Closes the client and all its resources (connections, ...)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/client/src/InfluxDBClient.ts:231](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L231)

***

### query()

> **query**(`query`, `database`?, `queryOptions`?): `AsyncGenerator`\<`Record`\<`string`, `any`\>, `void`, `void`\>

Execute a query and return the results as an async generator.

#### Parameters

##### query

`string`

The query string.

##### database?

`string`

The name of the database to query.

##### queryOptions?

`Partial`\<[`QueryOptions`](../../options/interfaces/QueryOptions.md)\> = `...`

The options for the query (default: { type: 'sql' }).

#### Returns

`AsyncGenerator`\<`Record`\<`string`, `any`\>, `void`, `void`\>

An async generator that yields maps of string keys to any values.

#### Example

```typescript
   client.query('SELECT * from net', 'traffic_db', {
      type: 'sql',
      headers: {
        'channel-pref': 'eu-west-7',
        'notify': 'central',
      },
    })
```

#### Defined in

[packages/client/src/InfluxDBClient.ts:179](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L179)

***

### queryPoints()

> **queryPoints**(`query`, `database`?, `queryOptions`?): `AsyncGenerator`\<[`PointValues`](../../PointValues/classes/PointValues.md), `void`, `void`\>

Execute a query and return the results as an async generator.

#### Parameters

##### query

`string`

The query string.

##### database?

`string`

The name of the database to query.

##### queryOptions?

`Partial`\<[`QueryOptions`](../../options/interfaces/QueryOptions.md)\> = `...`

The type of query (default: {type: 'sql'}).

#### Returns

`AsyncGenerator`\<[`PointValues`](../../PointValues/classes/PointValues.md), `void`, `void`\>

An async generator that yields PointValues object.

#### Example

```typescript
client.queryPoints('SELECT * FROM cpu', 'performance_db', {
      type: 'sql',
      params: {register: 'rax'},
    })
```

#### Defined in

[packages/client/src/InfluxDBClient.ts:212](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L212)

***

### write()

> **write**(`data`, `database`?, `org`?, `writeOptions`?): `Promise`\<`void`\>

Write data into specified database.

#### Parameters

##### data

[`WritableData`](../../util/generics/type-aliases/WritableData.md)

data to write

##### database?

`string`

database to write into

##### org?

`string`

organization to write into

##### writeOptions?

`Partial`\<[`WriteOptions`](../../options/interfaces/WriteOptions.md)\>

write options

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/client/src/InfluxDBClient.ts:143](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/InfluxDBClient.ts#L143)
