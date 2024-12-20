[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [impl/node/NodeHttpTransport](../index.md) / NodeHttpTransport

# Class: NodeHttpTransport

Transport layer on top of node http or https library.

## Implements

- [`Transport`](../../../../transport/interfaces/Transport.md)

## Constructors

### new NodeHttpTransport()

> **new NodeHttpTransport**(`connectionOptions`): [`NodeHttpTransport`](NodeHttpTransport.md)

Creates a node transport using for the client options supplied.

#### Parameters

##### connectionOptions

[`ConnectionOptions`](../../../../options/interfaces/ConnectionOptions.md)

connection options

#### Returns

[`NodeHttpTransport`](NodeHttpTransport.md)

#### Defined in

[packages/client/src/impl/node/NodeHttpTransport.ts:58](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/node/NodeHttpTransport.ts#L58)

## Methods

### iterate()

> **iterate**(`path`, `body`, `options`): `AsyncIterableIterator`\<`Uint8Array`\<`ArrayBufferLike`\>, `any`, `any`\>

Sends requestBody and returns response chunks in an async iterable
that can be easily consumed in an `for-await` loop.

#### Parameters

##### path

`string`

HTTP request path

##### body

`string`

##### options

[`SendOptions`](../../../../transport/interfaces/SendOptions.md)

send options

#### Returns

`AsyncIterableIterator`\<`Uint8Array`\<`ArrayBufferLike`\>, `any`, `any`\>

async iterable

#### Implementation of

[`Transport`](../../../../transport/interfaces/Transport.md).[`iterate`](../../../../transport/interfaces/Transport.md#iterate)

#### Defined in

[packages/client/src/impl/node/NodeHttpTransport.ts:218](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/node/NodeHttpTransport.ts#L218)

***

### request()

> **request**(`path`, `body`, `options`, `responseStarted`?): `Promise`\<`any`\>

Sends data to the server and receives decoded result. The type of the result depends on
response's content-type (deserialized json, text).

#### Parameters

##### path

`string`

HTTP path

##### body

`any`

##### options

[`SendOptions`](../../../../transport/interfaces/SendOptions.md)

send options

##### responseStarted?

[`ResponseStartedFn`](../../../../results/CommunicationObserver/type-aliases/ResponseStartedFn.md)

#### Returns

`Promise`\<`any`\>

Promise of response body

#### Implementation of

[`Transport`](../../../../transport/interfaces/Transport.md).[`request`](../../../../transport/interfaces/Transport.md#request)

#### Defined in

[packages/client/src/impl/node/NodeHttpTransport.ts:160](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/node/NodeHttpTransport.ts#L160)

***

### send()

> **send**(`path`, `body`, `options`, `callbacks`?): `void`

Sends data to server and receives communication events via communication callbacks.

#### Parameters

##### path

`string`

HTTP request  path

##### body

`string`

message body

##### options

[`SendOptions`](../../../../transport/interfaces/SendOptions.md)

##### callbacks?

`Partial`\<[`CommunicationObserver`](../../../../results/CommunicationObserver/interfaces/CommunicationObserver.md)\<`any`\>\>

communication callbacks

#### Returns

`void`

#### Implementation of

[`Transport`](../../../../transport/interfaces/Transport.md).[`send`](../../../../transport/interfaces/Transport.md#send)

#### Defined in

[packages/client/src/impl/node/NodeHttpTransport.ts:130](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/node/NodeHttpTransport.ts#L130)
