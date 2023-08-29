import {TimeConverter} from './WriteApi'
import {convertTimeToNanos, convertTime} from './util/time'
import {escape} from './util/escape'
import {WritePrecision} from './options'

export type PointRecord = {
  measurement: string
  fields: Record<string, number | string>
  tags?: Record<string, string>
  timestamp?: string | number | Date
}

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

const fieldEntryToLPString = (fe: FieldEntry): string => {
  switch (fe[0]) {
    case 'string':
      return escape.quoted(fe[1])
    case 'boolean':
      return fe[1] ? 'T' : 'F'
    case 'float':
      return `${fe[1]}`
    case 'integer':
      return `${fe[1]}i`
    case 'uinteger':
      return `${fe[1]}u`
  }
}

/**
 * Point defines values of a single measurement.
 */
export class Point {
  private _name: string
  private _tags: {[key: string]: string} = {}
  private _time: string | number | Date | undefined
  /** escaped field values */
  private _fields: {[key: string]: FieldEntry} = {}

  /**
   * Create a new Point with specified a measurement name.
   *
   * @param measurementName - the measurement name
   */
  constructor(measurementName?: string) {
    if (measurementName) this._name = measurementName
  }

  /**
   * Sets point's measurement.
   *
   * @param name - measurement name
   * @returns this
   */
  public measurement(name: string): Point {
    this._name = name
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
  public tag(name: string, value: string): Point {
    this._tags[name] = value
    return this
  }

  /**
   * Adds a boolean field.
   *
   * @param field - field name
   * @param value - field value
   * @returns this
   */
  public booleanField(name: string, value: boolean | any): Point {
    this._fields[name] = ['boolean', !!value]
    return this
  }

  /**
   * Adds an integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN or out of int64 range value is supplied
   */
  public intField(name: string, value: number | any): Point {
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
   * Adds an unsigned integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN out of range value is supplied
   */
  public uintField(name: string, value: number | any): Point {
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
   * Adds a number field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN/Infinity/-Infinity is supplied
   */
  public floatField(name: string, value: number | any): Point {
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
   * Adds a string field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   */
  public stringField(name: string, value: string | any): Point {
    if (value !== null && value !== undefined) {
      if (typeof value !== 'string') value = String(value)
      this._fields[name] = ['string', value]
    }
    return this
  }

  /**
   * Adds field based on provided type.
   *
   * @param name - field name
   * @param type - field type
   * @param value - field value
   * @returns this
   */
  public field(name: string, type: PointFieldType, value: any): Point {
    switch (type) {
      case 'string':
        return this.stringField(name, value)
      case 'boolean':
        return this.booleanField(name, value)
      case 'float':
        return this.floatField(name, value)
      case 'integer':
        return this.intField(name, value)
      case 'uinteger':
        return this.uintField(name, value)
      default:
        throw new Error(
          `invalid field type for field '${name}': type -> ${type}, value -> ${value}!`
        )
    }
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
    if (!type || type !== actualType)
      throw new Error(
        `field ${name} of type ${actualType} doesn't match expected type ${type}!`
      )
    return value
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
  public timestamp(value: Date | number | string | undefined): Point {
    this._time = value
    return this
  }

  /**
   * Creates an InfluxDB protocol line out of this instance.
   * @param settings - settings control serialization of a point timestamp and can also add default tags,
   * nanosecond timestamp precision is used when no `settings` or no `settings.convertTime` is supplied.
   * @returns an InfluxDB protocol line out of this instance
   */
  public toLineProtocol(
    convertTimePrecision?: TimeConverter | WritePrecision
  ): string | undefined {
    if (!this._name) return undefined
    let fieldsLine = ''
    Object.keys(this._fields)
      .sort()
      .forEach((x) => {
        if (x) {
          const fieldEntry = this._fields[x]
          const lpStringValue = fieldEntryToLPString(fieldEntry)
          if (fieldsLine.length > 0) fieldsLine += ','
          fieldsLine += `${escape.tag(x)}=${lpStringValue}`
        }
      })
    if (fieldsLine.length === 0) return undefined // no fields present
    let tagsLine = ''
    const tags = this._tags
    Object.keys(tags)
      .sort()
      .forEach((x) => {
        if (x) {
          const val = tags[x]
          if (val) {
            tagsLine += ','
            tagsLine += `${escape.tag(x)}=${escape.tag(val)}`
          }
        }
      })
    let time = this._time

    if (!convertTimePrecision) {
      time = convertTimeToNanos(time)
    } else if (typeof convertTimePrecision === 'string')
      time = convertTime(time, convertTimePrecision)
    else {
      time = convertTimePrecision(time)
    }

    return `${escape.measurement(this._name)}${tagsLine} ${fieldsLine}${
      time !== undefined ? ` ${time}` : ''
    }`
  }

  toString(): string {
    const line = this.toLineProtocol(undefined)
    return line ? line : `invalid point: ${JSON.stringify(this, undefined)}`
  }

  static fromRecord(record: PointRecord): Point {
    const {measurement, fields, tags, timestamp} = record

    if (!measurement)
      throw new Error('measurement must be defined on the Point record!')

    if (!fields) throw new Error('fields must be defined on the Point record!')

    const point = new Point(measurement)
    if (timestamp !== undefined) point.timestamp(timestamp)

    for (const [name, value] of Object.entries(fields)) {
      if (typeof value === 'number') point.floatField(name, value)
      else if (typeof value === 'string') point.stringField(name, value)
      else throw new Error(`unsuported type of field ${name}: ${typeof value}`)
    }

    if (tags)
      for (const [name, value] of Object.entries(tags)) {
        if (typeof value === 'string') point.tag(name, value)
        else throw new Error(`tag has to be string ${name}: ${typeof value}`)
      }

    return point
  }
}
