[**@influxdata/influxdb3-client**](../../../../index.md)

***

[@influxdata/influxdb3-client](../../../../modules.md) / [impl/browser/FetchTransport](../index.md) / default

# Class: default

Transport layer that use browser fetch.

## Implements

- [`Transport`](../../../../transport/interfaces/Transport.md)

## Constructors

### new default()

> **new default**(`_connectionOptions`): [`default`](default.md)

#### Parameters

##### \_connectionOptions

[`ConnectionOptions`](../../../../options/interfaces/ConnectionOptions.md)

#### Returns

[`default`](default.md)

#### Defined in

[packages/client/src/impl/browser/FetchTransport.ts:36](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/browser/FetchTransport.ts#L36)

## Properties

### chunkCombiner

> **chunkCombiner**: [`ChunkCombiner`](../../../../results/chunkCombiner/interfaces/ChunkCombiner.md)

#### Defined in

[packages/client/src/impl/browser/FetchTransport.ts:33](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/browser/FetchTransport.ts#L33)

***

### requestDecorator()

> **requestDecorator**: (`request`, `options`, `url`) => `void`

RequestDecorator allows to modify requests before sending.

The following example shows a function that adds gzip
compression of requests using pako.js.

```ts
const client = new InfluxDB({url: 'http://a'})
client.transport.requestDecorator = function(request, options) {
  const body = request.body
  if (
    typeof body === 'string' &&
    options.gzipThreshold !== undefined &&
    body.length > options.gzipThreshold
  ) {
    request.headers['content-encoding'] = 'gzip'
    request.body = pako.gzip(body)
  }
}
```

#### Parameters

##### request

`RequestInit`

##### options

[`SendOptions`](../../../../transport/interfaces/SendOptions.md)

##### url

`string`

#### Returns

`void`

#### Defined in

[packages/client/src/impl/browser/FetchTransport.ts:281](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/browser/FetchTransport.ts#L281)

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

[packages/client/src/impl/browser/FetchTransport.ts:177](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/browser/FetchTransport.ts#L177)

***

### request()

> **request**(`path`, `body`, `options`, `responseStarted`?): `Promise`\<`any`\>

Sends data to the server and receives decoded result. The type of the result depends on
response's content-type (deserialized json, text).

#### Parameters

##### path

`string`

HTTP request path

##### body

`any`

##### options

[`SendOptions`](../../../../transport/interfaces/SendOptions.md)

send options

##### responseStarted?

[`ResponseStartedFn`](../../../../results/CommunicationObserver/type-aliases/ResponseStartedFn.md)

#### Returns

`Promise`\<`any`\>

response data

#### Implementation of

[`Transport`](../../../../transport/interfaces/Transport.md).[`request`](../../../../transport/interfaces/Transport.md#request)

#### Defined in

[packages/client/src/impl/browser/FetchTransport.ts:206](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/browser/FetchTransport.ts#L206)

***

### send()

> **send**(`path`, `body`, `options`, `callbacks`?): `void`

Send data to the server and receive communication events via callbacks.

#### Parameters

##### path

`string`

HTTP request path

##### body

`string`

##### options

[`SendOptions`](../../../../transport/interfaces/SendOptions.md)

send options

##### callbacks?

`Partial`\<[`CommunicationObserver`](../../../../results/CommunicationObserver/interfaces/CommunicationObserver.md)\<`Uint8Array`\<`ArrayBufferLike`\>\>\>

communication callbacks to received data in Uint8Array

#### Returns

`void`

#### Implementation of

[`Transport`](../../../../transport/interfaces/Transport.md).[`send`](../../../../transport/interfaces/Transport.md#send)

#### Defined in

[packages/client/src/impl/browser/FetchTransport.ts:61](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/impl/browser/FetchTransport.ts#L61)
