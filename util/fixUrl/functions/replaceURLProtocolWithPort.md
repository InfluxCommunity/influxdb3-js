[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [util/fixUrl](../index.md) / replaceURLProtocolWithPort

# Function: replaceURLProtocolWithPort()

> **replaceURLProtocolWithPort**(`url`): `object`

replaceURLProtocolWithPort removes the "http://" or "https://" protocol from the given URL and replaces it with the port number.
Currently, Apache Arrow does not support the "http://" or "https://" protocol in the URL, so this function is used to remove it.
If a port number is already present in the URL, only the protocol is removed.
The function also returns a boolean value indicating whether the communication is safe or unsafe.
- If the URL starts with "https://", the communication is considered safe, and the returned boolean value will be true.
- If the URL starts with "http://", the communication is considered unsafe, and the returned boolean value will be false.
- If the URL does not start with either "http://" or "https://", the returned boolean value will be undefined.

## Parameters

### url

`string`

The URL to process.

## Returns

`object`

An object containing the modified URL with the protocol replaced by the port and a boolean value indicating the safety of communication (true for safe, false for unsafe) or undefined if not detected.

### safe

> **safe**: `undefined` \| `boolean`

### url

> **url**: `string`

## Defined in

[packages/client/src/util/fixUrl.ts:16](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/util/fixUrl.ts#L16)
