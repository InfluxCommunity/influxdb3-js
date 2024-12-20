[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [impl/WriteApiImpl](../index.md) / default

# Class: default

Asynchronous API that writes time-series data into InfluxDB.
This API always sends data to InfluxDB immediately

## Implements

- [`default`](../../../WriteApi/interfaces/default.md)

## Constructors

### new default()

> **new default**(`_options`): [`default`](default.md)

#### Parameters

##### \_options

[`ClientOptions`](../../../options/interfaces/ClientOptions.md)

#### Returns

[`default`](default.md)

#### Defined in

[packages/client/src/impl/WriteApiImpl.ts:13](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/WriteApiImpl.ts#L13)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

completition promise

#### Implementation of

[`default`](../../../WriteApi/interfaces/default.md).[`close`](../../../WriteApi/interfaces/default.md#close)

#### Defined in

[packages/client/src/impl/WriteApiImpl.ts:124](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/WriteApiImpl.ts#L124)

***

### doWrite()

> **doWrite**(`lines`, `bucket`, `org`?, `writeOptions`?): `Promise`\<`void`\>

Write lines of [Line Protocol](https://bit.ly/2QL99fu).

#### Parameters

##### lines

`string`[]

InfluxDB Line Protocol

##### bucket

`string`

##### org?

`string`

##### writeOptions?

`Partial`\<[`WriteOptions`](../../../options/interfaces/WriteOptions.md)\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`default`](../../../WriteApi/interfaces/default.md).[`doWrite`](../../../WriteApi/interfaces/default.md#dowrite)

#### Defined in

[packages/client/src/impl/WriteApiImpl.ts:34](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/WriteApiImpl.ts#L34)
