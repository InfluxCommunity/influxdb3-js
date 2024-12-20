[**@influxdata/influxdb3-client**](../../../index.md)

***

[@influxdata/influxdb3-client](../../../modules.md) / [util/time](../index.md) / currentTime

# Variable: currentTime

> `const` **currentTime**: `object`

Exposes functions that creates strings that represent a timestamp that
can be used in the line protocol. Micro and nano timestamps are emulated
depending on the js platform in use.

## Type declaration

### micros()

> **micros**: () => `string`

#### Returns

`string`

### millis()

> **millis**: () => `string`

#### Returns

`string`

### ms()

> **ms**: () => `string`

#### Returns

`string`

### nanos()

> **nanos**: () => `string`

#### Returns

`string`

### ns()

> **ns**: () => `string`

#### Returns

`string`

### s()

> **s**: () => `string`

#### Returns

`string`

### seconds()

> **seconds**: () => `string`

#### Returns

`string`

### us()

> **us**: () => `string`

#### Returns

`string`

## Defined in

[packages/client/src/util/time.ts:79](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/util/time.ts#L79)
