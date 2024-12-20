[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [transport](../index.md) / SendOptions

# Interface: SendOptions

Options for sending a request message.

## Properties

### gzipThreshold?

> `optional` **gzipThreshold**: `number`

When specified, message body larger than the treshold is gzipped

#### Defined in

[packages/client/src/transport.ts:11](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L11)

***

### headers?

> `optional` **headers**: `object`

Request HTTP headers.

#### Index Signature

 \[`key`: `string`\]: `string`

#### Defined in

[packages/client/src/transport.ts:9](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L9)

***

### method

> **method**: `string`

HTTP method (POST, PUT, GET, PATCH ...)

#### Defined in

[packages/client/src/transport.ts:7](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L7)

***

### signal?

> `optional` **signal**: `AbortSignal`

Abort signal

#### Defined in

[packages/client/src/transport.ts:13](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/transport.ts#L13)
