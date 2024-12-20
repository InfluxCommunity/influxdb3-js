[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [WriteApi](../index.md) / default

# Interface: default

Asynchronous API that writes time-series data into InfluxDB.
This API always sends data to InfluxDB immediately

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

completition promise

#### Defined in

[packages/client/src/WriteApi.ts:27](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/WriteApi.ts#L27)

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

`Partial`\<[`WriteOptions`](../../options/interfaces/WriteOptions.md)\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/client/src/WriteApi.ts:17](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/WriteApi.ts#L17)
