[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [util/time](../index.md) / dateToProtocolTimestamp

# Variable: dateToProtocolTimestamp

> `const` **dateToProtocolTimestamp**: `object`

dateToProtocolTimestamp provides converters for JavaScript Date to InfluxDB Write Protocol Timestamp. Keys are supported precisions.

## Type declaration

### ms()

> **ms**: (`d`) => `string`

#### Parameters

##### d

`Date`

#### Returns

`string`

### ns()

> **ns**: (`d`) => `string`

#### Parameters

##### d

`Date`

#### Returns

`string`

### s()

> **s**: (`d`) => `string`

#### Parameters

##### d

`Date`

#### Returns

`string`

### us()

> **us**: (`d`) => `string`

#### Parameters

##### d

`Date`

#### Returns

`string`

## Defined in

[packages/client/src/util/time.ts:93](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/util/time.ts#L93)
