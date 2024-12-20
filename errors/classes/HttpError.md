[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [errors](../index.md) / HttpError

# Class: HttpError

A general HTTP error.

## Extends

- `Error`

## Constructors

### new HttpError()

> **new HttpError**(`statusCode`, `statusMessage`, `body`?, `contentType`?, `headers`?, `message`?): [`HttpError`](HttpError.md)

#### Parameters

##### statusCode

`number`

##### statusMessage

`undefined` | `string`

##### body?

`string`

##### contentType?

`null` | `string`

##### headers?

`null` | [`HttpHeaders`](../../results/CommunicationObserver/type-aliases/HttpHeaders.md)

##### message?

`string`

#### Returns

[`HttpError`](HttpError.md)

#### Overrides

`Error.constructor`

#### Defined in

[packages/client/src/errors.ts:23](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L23)

## Properties

### body?

> `readonly` `optional` **body**: `string`

#### Defined in

[packages/client/src/errors.ts:26](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L26)

***

### code

> **code**: `undefined` \| `string`

application error code, when available

#### Defined in

[packages/client/src/errors.ts:18](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L18)

***

### contentType?

> `readonly` `optional` **contentType**: `null` \| `string`

#### Defined in

[packages/client/src/errors.ts:27](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L27)

***

### headers?

> `readonly` `optional` **headers**: `null` \| [`HttpHeaders`](../../results/CommunicationObserver/type-aliases/HttpHeaders.md)

#### Defined in

[packages/client/src/errors.ts:28](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L28)

***

### json

> **json**: `any`

json error response

#### Defined in

[packages/client/src/errors.ts:20](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L20)

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1077

***

### name

> **name**: `string`

#### Inherited from

`Error.name`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1076

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1078

***

### statusCode

> `readonly` **statusCode**: `number`

#### Defined in

[packages/client/src/errors.ts:24](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L24)

***

### statusMessage

> `readonly` **statusMessage**: `undefined` \| `string`

#### Defined in

[packages/client/src/errors.ts:25](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/errors.ts#L25)

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

#### Defined in

node\_modules/@types/node/globals.d.ts:143

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

#### Defined in

node\_modules/@types/node/globals.d.ts:145

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Create .stack property on a target object

#### Parameters

##### targetObject

`object`

##### constructorOpt?

`Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`

#### Defined in

node\_modules/@types/node/globals.d.ts:136
