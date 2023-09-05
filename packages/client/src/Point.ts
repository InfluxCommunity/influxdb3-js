import {TimeConverter} from './WriteApi'
import {convertTimeToNanos, convertTime} from './util/time'
import {escape} from './util/escape'
import {WritePrecision} from './options'
import {PointFieldType, PointValues} from './PointValues'

const fieldToLPString: {
  (type: 'float', value: number): string
  (type: 'integer', value: number): string
  (type: 'uinteger', value: number): string
  (type: 'string', value: string): string
  (type: 'boolean', value: boolean): string
  (type: PointFieldType, value: number | string | boolean): string
} = (type: PointFieldType, value: number | string | boolean): string => {
  switch (type) {
    case 'string':
      return escape.quoted(value as string)
    case 'boolean':
      return value ? 'T' : 'F'
    case 'float':
      return `${value}`
    case 'integer':
      return `${value}i`
    case 'uinteger':
      return `${value}u`
  }
}

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
export class Point {
  private readonly _values: PointValues

  /**
   * Create a new Point with specified a measurement name.
   *
   * @param measurementName - the measurement name
   */
  private constructor(measurementName: string)
  /**
   * Create a new Point with given values.
   * After creating Point, it's values shouldn't be modified directly by PointValues object.
   *
   * @param measurementName - the measurement name
   */
  private constructor(values: PointValues)
  private constructor(arg0?: PointValues | string) {
    if (arg0 instanceof PointValues) {
      this._values = arg0
    } else {
      this._values = new PointValues()
    }

    if (typeof arg0 === 'string') this._values.measurement(arg0)
  }

  public static measurement(name: string): Point {
    return new Point(name)
  }

  public static fromValues(values: PointValues): Point {
    return new Point(values)
  }

  /**
   * Sets point's measurement.
   *
   * @param name - measurement name
   * @returns this
   */
  public measurement(name: string): Point {
    this._values.measurement(name)
    return this
  }

  public getMeasurement(): string {
    return this._values.getMeasurement() as NonNullable<
      ReturnType<typeof this._values.getMeasurement>
    >
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
    this._values.tag(name, value)
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
    this._values.booleanField(name, value)
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
    this._values.intField(name, Math.floor(val))
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
      this._values.uintField(name, Math.floor(value as number))
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
      this._values.uintField(name, +strVal)
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

    this._values.floatField(name, val)
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
      this._values.stringField(name, value)
    }
    return this
  }

  /**
   * Adds field based on provided type.
   *
   * @param name - field name
   * @param value - field value
   * @param type - field type
   * @returns this
   */
  public field(name: string, value: any, type?: PointFieldType): Point {
    const inferedType = type ?? inferType(value)
    switch (inferedType) {
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
  public fields(fields: {[key: string]: number | boolean | string}): Point {
    for (const [name, value] of Object.entries(fields)) {
      this.field(name, value)
    }
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
    return this._values.getField(name, type as any)
  }

  public getFieldType(name: string): PointFieldType | undefined {
    return this._values.getFieldType(name)
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
    this._values.timestamp(value)
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
    if (!this._values.getMeasurement()) return undefined
    let fieldsLine = ''
    this._values
      .getFieldNames()
      .sort()
      .forEach((name) => {
        if (name) {
          const type = this._values.getFieldType(name)
          const value = this._values.getField(name)
          if (type === undefined || value === undefined) return
          const lpStringValue = fieldToLPString(type, value)
          if (fieldsLine.length > 0) fieldsLine += ','
          fieldsLine += `${escape.tag(name)}=${lpStringValue}`
        }
      })
    if (fieldsLine.length === 0) return undefined // no fields present
    let tagsLine = ''
    const tagNames = this._values.getTagNames()
    tagNames.sort().forEach((x) => {
      if (x) {
        const val = this._values.getTag(x)
        if (val) {
          tagsLine += ','
          tagsLine += `${escape.tag(x)}=${escape.tag(val)}`
        }
      }
    })
    let time = this._values.getTimestamp()

    if (!convertTimePrecision) {
      time = convertTimeToNanos(time)
    } else if (typeof convertTimePrecision === 'string')
      time = convertTime(time, convertTimePrecision)
    else {
      time = convertTimePrecision(time)
    }

    return `${escape.measurement(
      this.getMeasurement()
    )}${tagsLine} ${fieldsLine}${time !== undefined ? ` ${time}` : ''}`
  }

  toString(): string {
    const line = this.toLineProtocol(undefined)
    return line ? line : `invalid point: ${JSON.stringify(this, undefined)}`
  }

  copy(): Point {
    return new Point(this._values.copy())
  }
}
