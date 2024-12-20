[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [PointValues](../index.md) / PointValues

# Class: PointValues

Point defines values of a single measurement.

## Constructors

### new PointValues()

> **new PointValues**(): [`PointValues`](PointValues.md)

Create an empty PointValues.

#### Returns

[`PointValues`](PointValues.md)

#### Defined in

[packages/client/src/PointValues.ts:59](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L59)

## Methods

### asPoint()

> **asPoint**(`measurement`?): [`Point`](../../Point/classes/Point.md)

Creates new Point with this as values.

#### Parameters

##### measurement?

`string`

#### Returns

[`Point`](../../Point/classes/Point.md)

Point from this values.

#### Defined in

[packages/client/src/PointValues.ts:499](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L499)

***

### copy()

> **copy**(): [`PointValues`](PointValues.md)

Creates a copy of this object.

#### Returns

[`PointValues`](PointValues.md)

A new instance with same values.

#### Defined in

[packages/client/src/PointValues.ts:483](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L483)

***

### getBooleanField()

> **getBooleanField**(`name`): `undefined` \| `boolean`

Gets the boolean field value associated with the specified name.
Throws if actual type of field with given name is not boolean.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| `boolean`

The boolean field value or undefined.

#### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match boolean type.

#### Defined in

[packages/client/src/PointValues.ts:315](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L315)

***

### getField()

#### Call Signature

> **getField**(`name`, `type`): `undefined` \| `number`

Get field of numeric type.
Throws if actual type of field with given name is not given numeric type.
If the field is not present, returns undefined.

##### Parameters

###### name

`string`

field name

###### type

field numeric type

`"float"` | `"integer"` | `"uinteger"`

##### Returns

`undefined` \| `number`

this

##### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match provided numeric type.

##### Defined in

[packages/client/src/PointValues.ts:341](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L341)

#### Call Signature

> **getField**(`name`, `type`): `undefined` \| `string`

Get field of string type.
Throws if actual type of field with given name is not string.
If the field is not present, returns undefined.

##### Parameters

###### name

`string`

field name

###### type

`"string"`

field string type

##### Returns

`undefined` \| `string`

this

##### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match provided 'string' type.

##### Defined in

[packages/client/src/PointValues.ts:355](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L355)

#### Call Signature

> **getField**(`name`, `type`): `undefined` \| `boolean`

Get field of boolean type.
Throws if actual type of field with given name is not boolean.
If the field is not present, returns undefined.

##### Parameters

###### name

`string`

field name

###### type

`"boolean"`

field boolean type

##### Returns

`undefined` \| `boolean`

this

##### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match provided 'boolean' type.

##### Defined in

[packages/client/src/PointValues.ts:366](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L366)

#### Call Signature

> **getField**(`name`): `undefined` \| `string` \| `number` \| `boolean`

Get field without type check.
If the field is not present, returns undefined.

##### Parameters

###### name

`string`

field name

##### Returns

`undefined` \| `string` \| `number` \| `boolean`

this

##### Defined in

[packages/client/src/PointValues.ts:374](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L374)

***

### getFieldNames()

> **getFieldNames**(): `string`[]

Gets an array of field names associated with this object.

#### Returns

`string`[]

An array of field names.

#### Defined in

[packages/client/src/PointValues.ts:465](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L465)

***

### getFieldType()

> **getFieldType**(`name`): `undefined` \| [`PointFieldType`](../type-aliases/PointFieldType.md)

Gets the type of field with given name, if it exists.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| [`PointFieldType`](../type-aliases/PointFieldType.md)

The field type or undefined.

#### Defined in

[packages/client/src/PointValues.ts:394](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L394)

***

### getFloatField()

> **getFloatField**(`name`): `undefined` \| `number`

Gets the float field value associated with the specified name.
Throws if actual type of field with given name is not float.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| `number`

The float field value or undefined.

#### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match float type.

#### Defined in

[packages/client/src/PointValues.ts:165](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L165)

***

### getIntegerField()

> **getIntegerField**(`name`): `undefined` \| `number`

Gets the integer field value associated with the specified name.
Throws if actual type of field with given name is not integer.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| `number`

The integer field value or undefined.

#### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match integer type.

#### Defined in

[packages/client/src/PointValues.ts:201](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L201)

***

### getMeasurement()

> **getMeasurement**(): `undefined` \| `string`

Get measurement name. Can be undefined if not set.

#### Returns

`undefined` \| `string`

measurement name or undefined

#### Defined in

[packages/client/src/PointValues.ts:66](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L66)

***

### getStringField()

> **getStringField**(`name`): `undefined` \| `string`

Gets the string field value associated with the specified name.
Throws if actual type of field with given name is not string.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| `string`

The string field value or undefined.

#### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match string type.

#### Defined in

[packages/client/src/PointValues.ts:287](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L287)

***

### getTag()

> **getTag**(`name`): `undefined` \| `string`

Gets value of tag with given name. Returns undefined if tag not found.

#### Parameters

##### name

`string`

tag name

#### Returns

`undefined` \| `string`

tag value or undefined

#### Defined in

[packages/client/src/PointValues.ts:119](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L119)

***

### getTagNames()

> **getTagNames**(): `string`[]

Gets an array of tag names.

#### Returns

`string`[]

An array of tag names.

#### Defined in

[packages/client/src/PointValues.ts:152](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L152)

***

### getTimestamp()

> **getTimestamp**(): `undefined` \| `string` \| `number` \| `Date`

Get timestamp. Can be undefined if not set.

#### Returns

`undefined` \| `string` \| `number` \| `Date`

timestamp or undefined

#### Defined in

[packages/client/src/PointValues.ts:86](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L86)

***

### getUintegerField()

> **getUintegerField**(`name`): `undefined` \| `number`

Gets the uint field value associated with the specified name.
Throws if actual type of field with given name is not uint.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| `number`

The uint field value or undefined.

#### Throws

[GetFieldTypeMissmatchError](GetFieldTypeMissmatchError.md) Actual type of field doesn't match uint type.

#### Defined in

[packages/client/src/PointValues.ts:236](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L236)

***

### hasFields()

> **hasFields**(): `boolean`

Checks if this object has any fields.

#### Returns

`boolean`

true if fields are present, false otherwise.

#### Defined in

[packages/client/src/PointValues.ts:474](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L474)

***

### removeField()

> **removeField**(`name`): [`PointValues`](PointValues.md)

Removes a field with the specified name if it exists; otherwise, it does nothing.

#### Parameters

##### name

`string`

The name of the field to be removed.

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:455](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L455)

***

### removeTag()

> **removeTag**(`name`): [`PointValues`](PointValues.md)

Removes a tag with the specified name if it exists; otherwise, it does nothing.

#### Parameters

##### name

`string`

The name of the tag to be removed.

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:142](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L142)

***

### setBooleanField()

> **setBooleanField**(`name`, `value`): [`PointValues`](PointValues.md)

Sets a boolean field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:326](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L326)

***

### setField()

> **setField**(`name`, `value`, `type`?): [`PointValues`](PointValues.md)

Sets field based on provided type.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

##### type?

[`PointFieldType`](../type-aliases/PointFieldType.md)

field type

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:408](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L408)

***

### setFields()

> **setFields**(`fields`): [`PointValues`](PointValues.md)

Add fields according to their type. All numeric type is considered float

#### Parameters

##### fields

name-value map

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:440](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L440)

***

### setFloatField()

> **setFloatField**(`name`, `value`): [`PointValues`](PointValues.md)

Sets a number field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`PointValues`](PointValues.md)

this

#### Throws

NaN/Infinity/-Infinity is supplied

#### Defined in

[packages/client/src/PointValues.ts:177](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L177)

***

### setIntegerField()

> **setIntegerField**(`name`, `value`): [`PointValues`](PointValues.md)

Sets an integer field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`PointValues`](PointValues.md)

this

#### Throws

NaN or out of int64 range value is supplied

#### Defined in

[packages/client/src/PointValues.ts:213](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L213)

***

### setMeasurement()

> **setMeasurement**(`name`): [`PointValues`](PointValues.md)

Sets point's measurement.

#### Parameters

##### name

`string`

measurement name

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:76](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L76)

***

### setStringField()

> **setStringField**(`name`, `value`): [`PointValues`](PointValues.md)

Sets a string field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:298](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L298)

***

### setTag()

> **setTag**(`name`, `value`): [`PointValues`](PointValues.md)

Sets a tag. The caller has to ensure that both name and value are not empty
and do not end with backslash.

#### Parameters

##### name

`string`

tag name

##### value

`string`

tag value

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:131](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L131)

***

### setTimestamp()

> **setTimestamp**(`value`): [`PointValues`](PointValues.md)

Sets point timestamp. Timestamp can be specified as a Date (preferred), number, string
or an undefined value. An undefined value instructs to assign a local timestamp using
the client's clock. An empty string can be used to let the server assign
the timestamp. A number value represents time as a count of time units since epoch, the
exact time unit then depends on the InfluxDBClient.write \| precision of the API
that writes the point.

Beware that the current time in nanoseconds can't precisely fit into a JS number,
which can hold at most 2^53 integer number. Nanosecond precision numbers are thus supplied as
a (base-10) string. An application can also use ES2020 BigInt to represent nanoseconds,
BigInt's `toString()` returns the required high-precision string.

Note that InfluxDB requires the timestamp to fit into int64 data type.

#### Parameters

##### value

point time

`undefined` | `string` | `number` | `Date`

#### Returns

[`PointValues`](PointValues.md)

this

#### Defined in

[packages/client/src/PointValues.ts:108](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L108)

***

### setUintegerField()

> **setUintegerField**(`name`, `value`): [`PointValues`](PointValues.md)

Sets an unsigned integer field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`PointValues`](PointValues.md)

this

#### Throws

NaN out of range value is supplied

#### Defined in

[packages/client/src/PointValues.ts:248](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/PointValues.ts#L248)
