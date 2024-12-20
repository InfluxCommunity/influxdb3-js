[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [options](../index.md) / WriteOptions

# Interface: WriteOptions

Options used by InfluxDBClient.write .

## Example

```typescript
      client
        .write(point, DATABASE, 'cpu', {
          headers: {
            'channel-lane': 'reserved',
            'notify-central': '30m',
          },
          precision: 'ns',
          gzipThreshold: 1000,
        })
```

## Properties

### defaultTags?

> `optional` **defaultTags**: `object`

default tags

#### Index Signature

 \[`key`: `string`\]: `string`

#### Examples

```typescript
const client = new InfluxDBClient({
           host: 'https://eu-west-1-1.aws.cloud2.influxdata.com',
           writeOptions: {
             defaultTags: {
               device: 'nrdc-th-52-fd889e03',
             },
           },
})

const p = Point.measurement('measurement').setField('num', 3)

// this will write point with device=device-a tag
await client.write(p, 'my-db')
```

```typescript
const client = new InfluxDBClient({
           host: 'https://eu-west-1-1.aws.cloud2.influxdata.com',
})

const defaultTags = {
           device: 'rpi5_0_0599e8d7',
}

const p = Point.measurement('measurement').setField('num', 3)

// this will write point with device=device-a tag
await client.write(p, 'my-db', undefined, {defaultTags})
```

#### Defined in

[packages/client/src/options.ts:116](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L116)

***

### gzipThreshold?

> `optional` **gzipThreshold**: `number`

When specified, write bodies larger than the threshold are gzipped

#### Defined in

[packages/client/src/options.ts:80](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L80)

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

HTTP headers that will be sent with every write request

#### Defined in

[packages/client/src/options.ts:78](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L78)

***

### precision?

> `optional` **precision**: [`WritePrecision`](../type-aliases/WritePrecision.md)

Precision to use in writes for timestamp. default ns

#### Defined in

[packages/client/src/options.ts:75](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/options.ts#L75)
