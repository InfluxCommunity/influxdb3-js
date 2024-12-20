[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [options](../index.md) / QueryOptions

# Interface: QueryOptions

Options used by InfluxDBClient.query and by InfluxDBClient.queryPoints.

## Example

```typescript
const data = client.query('SELECT * FROM drive', 'ev_onboard_45ae770c', {
      type: 'sql',
      headers: {
        'one-off': 'totl', // one-off query header
        'change-on': 'shift1', // over-write universal value
      },
      params: {
        point: 'a7',
        action: 'reverse',
      },
    })
```

## Properties

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Custom headers to add to the request.

#### Defined in

[packages/client/src/options.ts:149](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L149)

***

### params?

> `optional` **params**: `Record`\<`string`, [`QParamType`](../../QueryApi/type-aliases/QParamType.md)\>

Parameters to accompany a query using them.

#### Defined in

[packages/client/src/options.ts:151](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L151)

***

### type

> **type**: [`QueryType`](../type-aliases/QueryType.md)

Type of query being sent, e.g. 'sql' or 'influxql'.

#### Defined in

[packages/client/src/options.ts:147](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L147)
