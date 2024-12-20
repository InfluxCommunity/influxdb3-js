[**@influxdata/influxdb3-client**](../../index.md)

***

[@influxdata/influxdb3-client](../../modules.md) / [Point](../index.md) / Point

# Class: Point

Point defines values of a single measurement.

## Methods

### copy()

> **copy**(): [`Point`](Point.md)

Creates a copy of this object.

#### Returns

[`Point`](Point.md)

A new instance with same values.

#### Defined in

[packages/client/src/Point.ts:421](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L421)

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

GetFieldTypeMissmatchError Actual type of field doesn't match boolean type.

#### Defined in

[packages/client/src/Point.ts:292](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L292)

***

### getField()

#### Call Signature

> **getField**(`name`, `type`): `undefined` \| `number`

Get field of numeric type.

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

Field type doesn't match actual type

##### Defined in

[packages/client/src/Point.ts:316](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L316)

#### Call Signature

> **getField**(`name`, `type`): `undefined` \| `string`

Get field of string type.

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

Field type doesn't match actual type

##### Defined in

[packages/client/src/Point.ts:328](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L328)

#### Call Signature

> **getField**(`name`, `type`): `undefined` \| `boolean`

Get field of boolean type.

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

Field type doesn't match actual type

##### Defined in

[packages/client/src/Point.ts:337](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L337)

#### Call Signature

> **getField**(`name`): `undefined` \| `string` \| `number` \| `boolean`

Get field without type check.

##### Parameters

###### name

`string`

field name

##### Returns

`undefined` \| `string` \| `number` \| `boolean`

this

##### Defined in

[packages/client/src/Point.ts:344](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L344)

***

### getFieldNames()

> **getFieldNames**(): `string`[]

Gets an array of field names associated with this object.

#### Returns

`string`[]

An array of field names.

#### Defined in

[packages/client/src/Point.ts:403](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L403)

***

### getFieldType()

> **getFieldType**(`name`): `undefined` \| [`PointFieldType`](../../PointValues/type-aliases/PointFieldType.md)

Gets the type of field with given name, if it exists.
If the field is not present, returns undefined.

#### Parameters

##### name

`string`

field name

#### Returns

`undefined` \| [`PointFieldType`](../../PointValues/type-aliases/PointFieldType.md)

The field type or undefined.

#### Defined in

[packages/client/src/Point.ts:359](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L359)

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

GetFieldTypeMissmatchError Actual type of field doesn't match float type.

#### Defined in

[packages/client/src/Point.ts:189](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L189)

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

GetFieldTypeMissmatchError Actual type of field doesn't match integer type.

#### Defined in

[packages/client/src/Point.ts:215](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L215)

***

### getMeasurement()

> **getMeasurement**(): `string`

Get measurement name.

#### Returns

`string`

measurement name

#### Defined in

[packages/client/src/Point.ts:88](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L88)

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

GetFieldTypeMissmatchError Actual type of field doesn't match string type.

#### Defined in

[packages/client/src/Point.ts:267](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L267)

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

[packages/client/src/Point.ts:143](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L143)

***

### getTagNames()

> **getTagNames**(): `string`[]

Gets an array of tag names.

#### Returns

`string`[]

An array of tag names.

#### Defined in

[packages/client/src/Point.ts:176](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L176)

***

### getTimestamp()

> **getTimestamp**(): `undefined` \| `string` \| `number` \| `Date`

Get timestamp. Can be undefined if not set.

#### Returns

`undefined` \| `string` \| `number` \| `Date`

timestamp or undefined

#### Defined in

[packages/client/src/Point.ts:110](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L110)

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

GetFieldTypeMissmatchError Actual type of field doesn't match uint type.

#### Defined in

[packages/client/src/Point.ts:241](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L241)

***

### hasFields()

> **hasFields**(): `boolean`

Checks if this object has any fields.

#### Returns

`boolean`

true if fields are present, false otherwise.

#### Defined in

[packages/client/src/Point.ts:412](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L412)

***

### removeField()

> **removeField**(`name`): [`Point`](Point.md)

Removes a field with the specified name if it exists; otherwise, it does nothing.

#### Parameters

##### name

`string`

The name of the field to be removed.

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:393](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L393)

***

### removeTag()

> **removeTag**(`name`): [`Point`](Point.md)

Removes a tag with the specified name if it exists; otherwise, it does nothing.

#### Parameters

##### name

`string`

The name of the tag to be removed.

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:166](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L166)

***

### setBooleanField()

> **setBooleanField**(`name`, `value`): [`Point`](Point.md)

Sets a boolean field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:303](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L303)

***

### setField()

> **setField**(`name`, `value`, `type`?): [`Point`](Point.md)

Sets field based on provided type.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

##### type?

[`PointFieldType`](../../PointValues/type-aliases/PointFieldType.md)

field type

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:371](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L371)

***

### setFields()

> **setFields**(`fields`): [`Point`](Point.md)

Add fields according to their type. All numeric type is considered float

#### Parameters

##### fields

name-value map

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:382](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L382)

***

### setFloatField()

> **setFloatField**(`name`, `value`): [`Point`](Point.md)

Sets a number field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`Point`](Point.md)

this

#### Throws

NaN/Infinity/-Infinity is supplied

#### Defined in

[packages/client/src/Point.ts:201](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L201)

***

### setIntegerField()

> **setIntegerField**(`name`, `value`): [`Point`](Point.md)

Sets an integer field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`Point`](Point.md)

this

#### Throws

NaN or out of int64 range value is supplied

#### Defined in

[packages/client/src/Point.ts:227](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L227)

***

### setMeasurement()

> **setMeasurement**(`name`): [`Point`](Point.md)

Sets point's measurement.

#### Parameters

##### name

`string`

measurement name

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:98](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L98)

***

### setStringField()

> **setStringField**(`name`, `value`): [`Point`](Point.md)

Sets a string field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:278](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L278)

***

### setTag()

> **setTag**(`name`, `value`): [`Point`](Point.md)

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

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:155](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L155)

***

### setTimestamp()

> **setTimestamp**(`value`): [`Point`](Point.md)

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

[`Point`](Point.md)

this

#### Defined in

[packages/client/src/Point.ts:132](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L132)

***

### setUintegerField()

> **setUintegerField**(`name`, `value`): [`Point`](Point.md)

Sets an unsigned integer field.

#### Parameters

##### name

`string`

field name

##### value

`any`

field value

#### Returns

[`Point`](Point.md)

this

#### Throws

NaN out of range value is supplied

#### Defined in

[packages/client/src/Point.ts:253](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L253)

***

### toLineProtocol()

> **toLineProtocol**(`convertTimePrecision`?, `defaultTags`?): `undefined` \| `string`

Creates an InfluxDB protocol line out of this instance.

#### Parameters

##### convertTimePrecision?

settings control serialization of a point timestamp and can also add default tags,
nanosecond timestamp precision is used when no `settings` or no `settings.convertTime` is supplied.

[`WritePrecision`](../../options/type-aliases/WritePrecision.md) | [`TimeConverter`](../../WriteApi/interfaces/TimeConverter.md)

##### defaultTags?

#### Returns

`undefined` \| `string`

an InfluxDB protocol line out of this instance

#### Defined in

[packages/client/src/Point.ts:431](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L431)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/client/src/Point.ts:497](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L497)

***

### fromValues()

> `static` **fromValues**(`values`): [`Point`](Point.md)

Creates new point from PointValues object.
Can throw error if measurement missing.

#### Parameters

##### values

[`PointValues`](../../PointValues/classes/PointValues.md)

point values object with measurement

#### Returns

[`Point`](Point.md)

new point from values

#### Throws

missing measurement

#### Defined in

[packages/client/src/Point.ts:76](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L76)

***

### measurement()

> `static` **measurement**(`name`): [`Point`](Point.md)

Creates new Point with given measurement.

#### Parameters

##### name

`string`

measurement name

#### Returns

[`Point`](Point.md)

new Point

#### Defined in

[packages/client/src/Point.ts:64](https://github.com/InfluxCommunity/influxdb3-js/blob/6328be2232de5032f7226e569b6b0154d8900f73/packages/client/src/Point.ts#L64)
