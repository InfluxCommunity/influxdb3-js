[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [results/CommunicationObserver](../index.md) / ResponseStartedFn

# Type Alias: ResponseStartedFn()

> **ResponseStartedFn**: (`headers`, `statusCode`?) => `void`

Informs about a start of response processing.

## Parameters

### headers

[`HttpHeaders`](HttpHeaders.md)

response HTTP headers

### statusCode?

`number`

response status code

## Returns

`void`

## Defined in

[packages/client/src/results/CommunicationObserver.ts:13](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/results/CommunicationObserver.ts#L13)
