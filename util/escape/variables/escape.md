[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [util/escape](../index.md) / escape

# Variable: escape

> `const` **escape**: `object`

Provides functions escape specific parts in InfluxDB line protocol.

## Type declaration

### measurement()

> **measurement**: (`value`) => `string`

Measurement escapes measurement names.

#### Parameters

##### value

`string`

#### Returns

`string`

### quoted()

> **quoted**: (`value`) => `string`

Quoted escapes quoted values, such as database names.

#### Parameters

##### value

`string`

#### Returns

`string`

### tag()

> **tag**: (`value`) => `string`

TagEscaper escapes tag keys, tag values, and field keys.

#### Parameters

##### value

`string`

#### Returns

`string`

## Defined in

[packages/client/src/util/escape.ts:37](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/util/escape.ts#L37)
