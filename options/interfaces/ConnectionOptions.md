[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [options](../index.md) / ConnectionOptions

# Interface: ConnectionOptions

Option for the communication with InfluxDB server.

## Extended by

- [`ClientOptions`](ClientOptions.md)

## Properties

### authScheme?

> `optional` **authScheme**: `string`

token authentication scheme. Not set for Cloud access, set to 'Bearer' for Edge.

#### Defined in

[packages/client/src/options.ts:13](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L13)

***

### database?

> `optional` **database**: `string`

default database for write query if not present as argument.

#### Defined in

[packages/client/src/options.ts:27](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L27)

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Default HTTP headers to send with every request.

#### Defined in

[packages/client/src/options.ts:44](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L44)

***

### host

> **host**: `string`

base host URL

#### Defined in

[packages/client/src/options.ts:9](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L9)

***

### proxyUrl?

> `optional` **proxyUrl**: `string`

Full HTTP web proxy URL including schema, for example http://your-proxy:8080.

#### Defined in

[packages/client/src/options.ts:48](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L48)

***

### queryTimeout?

> `optional` **queryTimeout**: `number`

stream timeout for query (grpc timeout). The gRPC doesn't apply the socket timeout to operations as is defined above. To successfully close a call to the gRPC endpoint, the queryTimeout must be specified. Without this timeout, a gRPC call might end up in an infinite wait state.

#### Default Value

```ts
60000
```

#### Defined in

[packages/client/src/options.ts:23](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L23)

***

### timeout?

> `optional` **timeout**: `number`

socket timeout. 10000 milliseconds by default in node.js. Not applicable in browser (option is ignored).

#### Default Value

```ts
10000
```

#### Defined in

[packages/client/src/options.ts:18](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L18)

***

### token?

> `optional` **token**: `string`

authentication token

#### Defined in

[packages/client/src/options.ts:11](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L11)

***

### transportOptions?

> `optional` **transportOptions**: `object`

TransportOptions supply extra options for the transport layer, they differ between node.js and browser/deno.
Node.js transport accepts options specified in [http.request](https://nodejs.org/api/http.html#http_http_request_options_callback) or
[https.request](https://nodejs.org/api/https.html#https_https_request_options_callback). For example, an `agent` property can be set to
[setup HTTP/HTTPS proxy](https://www.npmjs.com/package/proxy-http-agent), [rejectUnauthorized](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback)
property can disable TLS server certificate verification. Additionally,
[follow-redirects](https://github.com/follow-redirects/follow-redirects) property can be also specified
in order to follow redirects in node.js.
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) is used under the hood in browser/deno.
For example,
[redirect](https://developer.mozilla.org/en-US/docs/Web/API/fetch) property can be set to 'error' to abort request if a redirect occurs.

#### Index Signature

 \[`key`: `string`\]: `any`

#### Defined in

[packages/client/src/options.ts:40](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L40)