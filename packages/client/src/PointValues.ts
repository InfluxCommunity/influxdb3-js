import {Point} from './Point'

export type PointFieldType =
  | 'float'
  | 'integer'
  | 'uinteger'
  | 'string'
  | 'boolean'

type FieldEntryFloat = ['float', number]
type FieldEntryInteger = ['integer', number]
type FieldEntryUinteger = ['uinteger', number]
type FieldEntryString = ['string', string]
type FieldEntryBoolean = ['boolean', boolean]

type FieldEntry =
  | FieldEntryFloat
  | FieldEntryInteger
  | FieldEntryUinteger
  | FieldEntryString
  | FieldEntryBoolean

const inferType = (
  value: number | string | boolean | undefined
): PointFieldType | undefined => {
  if (typeof value === 'number') return 'float'
  else if (typeof value === 'string') return 'string'
  else if (typeof value === 'boolean') return 'boolean'
  else return undefined
}

export class GetFieldTypeMissmatchError extends Error {
  /* istanbul ignore next */
  constructor(
    fieldName: string,
    expectedType: PointFieldType,
    actualType: PointFieldType
  ) {
    super(
      `field ${fieldName} of type ${actualType} doesn't match expected type ${expectedType}!`
    )
    this.name = 'GetFieldTypeMissmatchError'
    Object.setPrototypeOf(this, GetFieldTypeMissmatchError.prototype)
  }
}

/**
 * Point defines values of a single measurement.
 */
export class PointValues {
  private _name: string | undefined
  private _time: string | number | Date | undefined
  private _tags: {[key: string]: string} = {}
  private _fields: {[key: string]: FieldEntry} = {}

  /**
   * Create an empty PointValues.
   */
  constructor() {}

  /**
   * Get measurement name. Can be undefined if not set.
   *
   * @returns measurement name or undefined
   */
  getMeasurement(): string | undefined {
    return this._name
  }

  /**
   * Sets point's measurement.
   *
   * @param name - measurement name
   * @returns this
   */
  public setMeasurement(name: string): PointValues {
    this._name = name
    return this
  }

  /**
   * Get timestamp. Can be undefined if not set.
   *
   * @returns timestamp or undefined
   */
  public getTimestamp(): Date | number | string | undefined {
    return this._time
  }

  /**
   * Sets point timestamp. Timestamp can be specified as a Date (preferred), number, string
   * or an undefined value. An undefined value instructs to assign a local timestamp using
   * the client's clock. An empty string can be used to let the server assign
   * the timestamp. A number value represents time as a count of time units since epoch, the
   * exact time unit then depends on the {@link InfluxDBClient.write | precision} of the API
   * that writes the point.
   *
   * Beware that the current time in nanoseconds can't precisely fit into a JS number,
   * which can hold at most 2^53 integer number. Nanosecond precision numbers are thus supplied as
   * a (base-10) string. An application can also use ES2020 BigInt to represent nanoseconds,
   * BigInt's `toString()` returns the required high-precision string.
   *
   * Note that InfluxDB requires the timestamp to fit into int64 data type.
   *
   * @param value - point time
   * @returns this
   */
  public setTimestamp(value: Date | number | string | undefined): PointValues {
    this._time = value
    return this
  }

  /**
   * Gets value of tag with given name. Returns undefined if tag not found.
   *
   * @param name - tag name
   * @returns tag value or undefined
   */
  public getTag(name: string): string | undefined {
    return this._tags[name]
  }

  /**
   * Sets a tag. The caller has to ensure that both name and value are not empty
   * and do not end with backslash.
   *
   * @param name - tag name
   * @param value - tag value
   * @returns this
   */
  public setTag(name: string, value: string): PointValues {
    this._tags[name] = value
    return this
  }

  /**
   * Removes a tag with the specified name if it exists; otherwise, it does nothing.
   *
   * @param name - The name of the tag to be removed.
   * @returns this
   */
  public removeTag(name: string): PointValues {
    delete this._tags[name]
    return this
  }

  /**
   * Gets an array of tag names.
   *
   * @returns An array of tag names.
   */
  public getTagNames(): string[] {
    return Object.keys(this._tags)
  }

  /**
   * Gets the float field value associated with the specified name.
   * Throws if actual type of field with given name is not float.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match float type.
   * @returns The float field value or undefined.
   */
  public getFloatField(name: string): number | undefined {
    return this.getField(name, 'float')
  }

  /**
   * Sets a number field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN/Infinity/-Infinity is supplied
   */
  public setFloatField(name: string, value: number | any): PointValues {
    let val: number
    if (typeof value === 'number') {
      val = value
    } else {
      val = parseFloat(value)
    }
    if (!isFinite(val)) {
      throw new Error(`invalid float value for field '${name}': '${value}'!`)
    }

    this._fields[name] = ['float', val]
    return this
  }

  /**
   * Gets the integer field value associated with the specified name.
   * Throws if actual type of field with given name is not integer.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match integer type.
   * @returns The integer field value or undefined.
   */
  public getIntegerField(name: string): number | undefined {
    return this.getField(name, 'integer')
  }

  /**
   * Sets an integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN or out of int64 range value is supplied
   */
  public setIntegerField(name: string, value: number | any): PointValues {
    let val: number
    if (typeof value === 'number') {
      val = value
    } else {
      val = parseInt(String(value))
    }
    if (isNaN(val) || val <= -9223372036854776e3 || val >= 9223372036854776e3) {
      throw new Error(`invalid integer value for field '${name}': '${value}'!`)
    }
    this._fields[name] = ['integer', Math.floor(val)]
    return this
  }

  /**
   * Gets the uint field value associated with the specified name.
   * Throws if actual type of field with given name is not uint.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match uint type.
   * @returns The uint field value or undefined.
   */
  public getUintegerField(name: string): number | undefined {
    return this.getField(name, 'uinteger')
  }

  /**
   * Sets an unsigned integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN out of range value is supplied
   */
  public setUintegerField(name: string, value: number | any): PointValues {
    if (typeof value === 'number') {
      if (isNaN(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
        throw new Error(`uint value for field '${name}' out of range: ${value}`)
      }
      this._fields[name] = ['uinteger', Math.floor(value as number)]
    } else {
      const strVal = String(value)
      for (let i = 0; i < strVal.length; i++) {
        const code = strVal.charCodeAt(i)
        if (code < 48 || code > 57) {
          throw new Error(
            `uint value has an unsupported character at pos ${i}: ${value}`
          )
        }
      }
      if (
        strVal.length > 20 ||
        (strVal.length === 20 &&
          strVal.localeCompare('18446744073709551615') > 0)
      ) {
        throw new Error(
          `uint value for field '${name}' out of range: ${strVal}`
        )
      }
      this._fields[name] = ['uinteger', +strVal]
    }
    return this
  }

  /**
   * Gets the string field value associated with the specified name.
   * Throws if actual type of field with given name is not string.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match string type.
   * @returns The string field value or undefined.
   */
  public getStringField(name: string): string | undefined {
    return this.getField(name, 'string')
  }

  /**
   * Sets a string field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   */
  public setStringField(name: string, value: string | any): PointValues {
    if (value !== null && value !== undefined) {
      if (typeof value !== 'string') value = String(value)
      this._fields[name] = ['string', value]
    }
    return this
  }

  /**
   * Gets the boolean field value associated with the specified name.
   * Throws if actual type of field with given name is not boolean.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match boolean type.
   * @returns The boolean field value or undefined.
   */
  public getBooleanField(name: string): boolean | undefined {
    return this.getField(name, 'boolean')
  }

  /**
   * Sets a boolean field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   */
  public setBooleanField(name: string, value: boolean | any): PointValues {
    this._fields[name] = ['boolean', !!value]
    return this
  }

  /**
   * Get field of numeric type.
   * Throws if actual type of field with given name is not given numeric type.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @param type - field numeric type
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match provided numeric type.
   * @returns this
   */
  public getField(
    name: string,
    type: 'float' | 'integer' | 'uinteger'
  ): number | undefined
  /**
   * Get field of string type.
   * Throws if actual type of field with given name is not string.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @param type - field string type
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match provided 'string' type.
   * @returns this
   */
  public getField(name: string, type: 'string'): string | undefined
  /**
   * Get field of boolean type.
   * Throws if actual type of field with given name is not boolean.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @param type - field boolean type
   * @throws {@link GetFieldTypeMissmatchError} Actual type of field doesn't match provided 'boolean' type.
   * @returns this
   */
  public getField(name: string, type: 'boolean'): boolean | undefined
  /**
   * Get field without type check.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @returns this
   */
  public getField(name: string): number | string | boolean | undefined
  public getField(
    name: string,
    type?: PointFieldType
  ): number | string | boolean | undefined {
    const fieldEntry = this._fields[name]
    if (!fieldEntry) return undefined
    const [actualType, value] = fieldEntry
    if (type !== undefined && type !== actualType)
      throw new GetFieldTypeMissmatchError(name, type, actualType)
    return value
  }

  /**
   * Gets the type of field with given name, if it exists.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @returns The field type or undefined.
   */
  public getFieldType(name: string): PointFieldType | undefined {
    const fieldEntry = this._fields[name]
    if (!fieldEntry) return undefined
    return fieldEntry[0]
  }

  /**
   * Sets field based on provided type.
   *
   * @param name - field name
   * @param value - field value
   * @param type - field type
   * @returns this
   */
  public setField(
    name: string,
    value: any,
    type?: PointFieldType
  ): PointValues {
    const inferedType = type ?? inferType(value)
    switch (inferedType) {
      case 'string':
        return this.setStringField(name, value)
      case 'boolean':
        return this.setBooleanField(name, value)
      case 'float':
        return this.setFloatField(name, value)
      case 'integer':
        return this.setIntegerField(name, value)
      case 'uinteger':
        return this.setUintegerField(name, value)
      case undefined:
        return this
      default:
        throw new Error(
          `invalid field type for field '${name}': type -> ${type}, value -> ${value}!`
        )
    }
  }

  /**
   * Add fields according to their type. All numeric type is considered float
   *
   * @param fields - name-value map
   * @returns this
   */
  public setFields(fields: {
    [key: string]: number | boolean | string
  }): PointValues {
    for (const [name, value] of Object.entries(fields)) {
      this.setField(name, value)
    }
    return this
  }

  /**
   * Removes a field with the specified name if it exists; otherwise, it does nothing.
   *
   * @param name - The name of the field to be removed.
   * @returns this
   */
  public removeField(name: string): PointValues {
    delete this._fields[name]
    return this
  }

  /**
   * Gets an array of field names associated with this object.
   *
   * @returns An array of field names.
   */
  public getFieldNames(): string[] {
    return Object.keys(this._fields)
  }

  /**
   * Checks if this object has any fields.
   *
   * @returns true if fields are present, false otherwise.
   */
  public hasFields(): boolean {
    return this.getFieldNames().length > 0
  }

  /**
   * Creates a copy of this object.
   *
   * @returns A new instance with same values.
   */
  copy(): PointValues {
    const copy = new PointValues()
    copy._name = this._name
    copy._time = this._time
    copy._tags = Object.fromEntries(Object.entries(this._tags))
    copy._fields = Object.fromEntries(
      Object.entries(this._fields).map((entry) => [...entry])
    )
    return copy
  }

  /**
   * Creates new Point with this as values.
   *
   * @returns Point from this values.
   */
  public asPoint(measurement?: string): Point {
    return Point.fromValues(
      measurement ? this.setMeasurement(measurement) : this
    )
  }
}
