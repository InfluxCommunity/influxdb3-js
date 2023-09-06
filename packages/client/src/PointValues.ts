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
   * Adds a tag. The caller has to ensure that both name and value are not empty
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

  public getTag(name: string): string | undefined {
    return this._tags[name]
  }

  public removeTag(name: string): PointValues {
    delete this._tags[name]
    return this
  }

  public getTagNames(): string[] {
    return Object.keys(this._tags)
  }

  public getFloatField(name: string): number | undefined {
    return this.getField(name, 'float')
  }

  /**
   * Adds a number field.
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

  public getIntField(name: string): number | undefined {
    return this.getField(name, 'integer')
  }

  /**
   * Adds an integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN or out of int64 range value is supplied
   */
  public setIntField(name: string, value: number | any): PointValues {
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

  public getUintField(name: string): number | undefined {
    return this.getField(name, 'uinteger')
  }

  /**
   * Adds an unsigned integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN out of range value is supplied
   */
  public setUintField(name: string, value: number | any): PointValues {
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

  public getStringField(name: string): string | undefined {
    return this.getField(name, 'string')
  }

  /**
   * Adds a string field.
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

  public getBooleanField(name: string): boolean | undefined {
    return this.getField(name, 'boolean')
  }

  /**
   * Adds a boolean field.
   *
   * @param field - field name
   * @param value - field value
   * @returns this
   */
  public setBooleanField(name: string, value: boolean | any): PointValues {
    this._fields[name] = ['boolean', !!value]
    return this
  }

  /**
   * Get field of numeric type.
   *
   * @param name - field name
   * @param type - field numeric type
   * @throws Field type doesn't match actual type
   * @returns this
   */
  public getField(
    name: string,
    type: 'float' | 'integer' | 'uinteger'
  ): number | undefined
  /**
   * Get field of string type.
   *
   * @param name - field name
   * @param type - field string type
   * @throws Field type doesn't match actual type
   * @returns this
   */
  public getField(name: string, type: 'string'): string | undefined
  /**
   * Get field of boolean type.
   *
   * @param name - field name
   * @param type - field boolean type
   * @throws Field type doesn't match actual type
   * @returns this
   */
  public getField(name: string, type: 'boolean'): boolean | undefined
  /**
   * Get field without type check.
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
      throw new Error(
        `field ${name} of type ${actualType} doesn't match expected type ${type}!`
      )
    return value
  }

  public getFieldType(name: string): PointFieldType | undefined {
    const fieldEntry = this._fields[name]
    if (!fieldEntry) return undefined
    return fieldEntry[0]
  }

  /**
   * Adds field based on provided type.
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
        return this.setIntField(name, value)
      case 'uinteger':
        return this.setUintField(name, value)
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
   * @param name - field name
   * @param value - field value
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

  public removeField(name: string): PointValues {
    delete this._fields[name]
    return this
  }

  public getFieldNames(): string[] {
    return Object.keys(this._fields)
  }

  public hasFields(): boolean {
    return this.getFieldNames().length > 0
  }

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

  public asPoint(): Point {
    return Point.fromValues(this)
  }
}
