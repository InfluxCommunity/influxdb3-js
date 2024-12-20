[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [PointValues](../index.md) / GetFieldTypeMissmatchError

# Class: GetFieldTypeMissmatchError

## Extends

- `Error`

## Constructors

### new GetFieldTypeMissmatchError()

> **new GetFieldTypeMissmatchError**(`fieldName`, `expectedType`, `actualType`): [`GetFieldTypeMissmatchError`](GetFieldTypeMissmatchError.md)

#### Parameters

##### fieldName

`string`

##### expectedType

[`PointFieldType`](../type-aliases/PointFieldType.md)

##### actualType

[`PointFieldType`](../type-aliases/PointFieldType.md)

#### Returns

[`GetFieldTypeMissmatchError`](GetFieldTypeMissmatchError.md)

#### Overrides

`Error.constructor`

#### Defined in

[packages/client/src/PointValues.ts:34](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L34)

## Properties

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
