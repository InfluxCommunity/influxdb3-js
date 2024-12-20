[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [results/CommunicationObserver](../index.md) / CommunicationObserver

# Interface: CommunicationObserver\<T\>

Observes communication with the server.

## Type Parameters

• **T**

## Properties

### responseStarted?

> `optional` **responseStarted**: [`ResponseStartedFn`](../type-aliases/ResponseStartedFn.md)

Informs about a start of response processing.

#### Defined in

[packages/client/src/results/CommunicationObserver.ts:40](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L40)

***

### useCancellable()?

> `optional` **useCancellable**: (`cancellable`) => `void`

Setups cancelllable for this communication.

#### Parameters

##### cancellable

[`Cancellable`](../../Cancellable/interfaces/Cancellable.md)

#### Returns

`void`

#### Defined in

[packages/client/src/results/CommunicationObserver.ts:44](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L44)

***

### useResume()?

> `optional` **useResume**: (`resume`) => `void`

Setups a callback that resumes reading of next data, it is called whenever
[CommunicationObserver.next](CommunicationObserver.md#next) returns `false`.

#### Parameters

##### resume

() => `void`

a function that will resume reading of next data when called

#### Returns

`void`

#### Defined in

[packages/client/src/results/CommunicationObserver.ts:51](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L51)

## Methods

### complete()

> **complete**(): `void`

Communication was successful.

#### Returns

`void`

#### Defined in

[packages/client/src/results/CommunicationObserver.ts:36](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L36)

***

### error()

> **error**(`error`): `void`

Communication ended with an error.

#### Parameters

##### error

`Error`

#### Returns

`void`

#### Defined in

[packages/client/src/results/CommunicationObserver.ts:32](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L32)

***

### next()

> **next**(`data`): `boolean` \| `void`

Data chunk received, can be called multiple times.

#### Parameters

##### data

`T`

data

#### Returns

`boolean` \| `void`

when `false` value is returned and [CommunicationObserver.useResume](CommunicationObserver.md#useresume) is defined,
future calls to `next` are paused until resume is called.

#### Defined in

[packages/client/src/results/CommunicationObserver.ts:28](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L28)
