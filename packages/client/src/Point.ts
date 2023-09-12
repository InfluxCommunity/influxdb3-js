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

    if (typeof arg0 === 'string') this._values.setMeasurement(arg0)
  }

  public static measurement(name: string): Point {
    return new Point(name)
  }

  public static fromValues(values: PointValues): Point {
    return new Point(values)
  }

  public getMeasurement(): string {
    return this._values.getMeasurement() as string
  }

  /**
   * Sets point's measurement.
   *
   * @param name - measurement name
   * @returns this
   */
  public setMeasurement(name: string): Point {
    this._values.setMeasurement(name)
    return this
  }

  public getTimestamp(): Date | number | string | undefined {
    return this._values.getTimestamp()
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
  public setTimestamp(value: Date | number | string | undefined): Point {
    this._values.setTimestamp(value)
    return this
  }

  public getTag(name: string): string | undefined {
    return this._values.getTag(name)
  }

  /**
   * Adds a tag. The caller has to ensure that both name and value are not empty
   * and do not end with backslash.
   *
   * @param name - tag name
   * @param value - tag value
   * @returns this
   */
  public setTag(name: string, value: string): Point {
    this._values.setTag(name, value)
    return this
  }

  public removeTag(name: string): Point {
    this._values.removeTag(name)
    return this
  }

  public getTagNames(): string[] {
    return this._values.getTagNames()
  }

  public getFloatField(name: string): number | undefined {
    return this._values.getFloatField(name)
  }

  /**
   * Adds a number field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN/Infinity/-Infinity is supplied
   */
  public setFloatField(name: string, value: number | any): Point {
    this._values.setFloatField(name, value)
    return this
  }

  public getIntegerField(name: string): number | undefined {
    return this._values.getIntegerField(name)
  }

  /**
   * Adds an integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN or out of int64 range value is supplied
   */
  public setIntegerField(name: string, value: number | any): Point {
    this._values.setIntegerField(name, value)
    return this
  }
  public getUintegerField(name: string): number | undefined {
    return this._values.getUintegerField(name)
  }

  /**
   * Adds an unsigned integer field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   * @throws NaN out of range value is supplied
   */
  public setUintegerField(name: string, value: number | any): Point {
    this._values.setUintegerField(name, value)
    return this
  }
  public getStringField(name: string): string | undefined {
    return this._values.getStringField(name)
  }

  /**
   * Adds a string field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   */
  public setStringField(name: string, value: string | any): Point {
    this._values.setStringField(name, value)
    return this
  }
  public getBooleanField(name: string): boolean | undefined {
    return this._values.getBooleanField(name)
  }

  /**
   * Adds a boolean field.
   *
   * @param field - field name
   * @param value - field value
   * @returns this
   */
  public setBooleanField(name: string, value: boolean | any): Point {
    this._values.setBooleanField(name, value)
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
   * Adds field based on provided type.
   *
   * @param name - field name
   * @param value - field value
   * @param type - field type
   * @returns this
   */
  public setField(name: string, value: any, type?: PointFieldType): Point {
    this._values.setField(name, value, type)
    return this
  }

  /**
   * Add fields according to their type. All numeric type is considered float
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   */
  public setFields(fields: {[key: string]: number | boolean | string}): Point {
    this._values.setFields(fields)
    return this
  }

  public removeField(name: string): Point {
    this._values.removeField(name)
    return this
  }

  public getFieldNames(): string[] {
    return this._values.getFieldNames()
  }

  public hasFields(): boolean {
    return this._values.hasFields()
  }

  copy(): Point {
    return new Point(this._values.copy())
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
}
