[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [util/generics](../index.md) / WritableData

# Type Alias: WritableData

> **WritableData**: `ArrayLike`\<`string`\> \| `ArrayLike`\<[`Point`](../../../Point/classes/Point.md)\> \| `string` \| [`Point`](../../../Point/classes/Point.md)

The `WritableData` type represents different types of data that can be written.
The data can either be a uniform ArrayLike collection or a single value of the following types:

- `Point`: Represents a [Point](../../../Point/classes/Point.md) object.

- `string`: Represents lines of the [Line Protocol](https://bit.ly/2QL99fu).

## Defined in

[packages/client/src/util/generics.ts:12](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/util/generics.ts#L12)
