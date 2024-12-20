[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [transport](../index.md) / Transport

# Interface: Transport

Simpified platform-neutral transport layer for communication with InfluxDB.

## Methods

### iterate()

> **iterate**(`path`, `requestBody`, `options`): `AsyncIterableIterator`\<`Uint8Array`\<`ArrayBufferLike`\>, `any`, `any`\>

Sends requestBody and returns response chunks in an async iterable
that can be easily consumed in an `for-await` loop.

#### Parameters

##### path

`string`

HTTP request path

##### requestBody

`any`

request body

##### options

[`SendOptions`](SendOptions.md)

send options

#### Returns

`AsyncIterableIterator`\<`Uint8Array`\<`ArrayBufferLike`\>, `any`, `any`\>

async iterable

#### Defined in

[packages/client/src/transport.ts:60](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L60)

***

### request()

> **request**(`path`, `requestBody`, `options`, `responseStarted`?): `Promise`\<`any`\>

Sends data to the server and receives decoded result. The type of the result depends on
response's content-type (deserialized json, text).

#### Parameters

##### path

`string`

HTTP request path

##### requestBody

`any`

request body

##### options

[`SendOptions`](SendOptions.md)

send options

##### responseStarted?

[`ResponseStartedFn`](../../results/CommunicationObserver/type-aliases/ResponseStartedFn.md)

#### Returns

`Promise`\<`any`\>

response data

#### Defined in

[packages/client/src/transport.ts:44](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L44)

***

### send()

> **send**(`path`, `requestBody`, `options`, `callbacks`?): `void`

Send data to the server and receive communication events via callbacks.

#### Parameters

##### path

`string`

HTTP request path

##### requestBody

`string`

HTTP request body

##### options

[`SendOptions`](SendOptions.md)

send options

##### callbacks?

`Partial`\<[`CommunicationObserver`](../../results/CommunicationObserver/interfaces/CommunicationObserver.md)\<`Uint8Array`\<`ArrayBufferLike`\>\>\>

communication callbacks to received data in Uint8Array

#### Returns

`void`

#### Defined in

[packages/client/src/transport.ts:28](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L28)
