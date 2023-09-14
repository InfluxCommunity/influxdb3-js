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

  /**
   * Creates new Point with given measurement.
   *
   * @param name - measurement name
   * @returns new Point
   */
  public static measurement(name: string): Point {
    return new Point(name)
  }

  /**
   * Creates new point from PointValues object.
   * Can throw error if measurement missing.
   *
   * @param values - point values object with measurement
   * @throws missing measurement
   * @returns new point from values
   */
  public static fromValues(values: PointValues): Point {
    if (!values.getMeasurement() || values.getMeasurement() === '') {
      throw new Error('Cannot convert values to point without measurement set!')
    }
    return new Point(values)
  }

  /**
   * Get measurement name.
   *
   * @returns measurement name
   */
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
    if (name !== '') {
      this._values.setMeasurement(name)
    }
    return this
  }

  /**
   * Get timestamp. Can be undefined if not set.
   *
   * @returns timestamp or undefined
   */
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

  /**
   * Gets value of tag with given name. Returns undefined if tag not found.
   *
   * @param name - tag name
   * @returns tag value or undefined
   */
  public getTag(name: string): string | undefined {
    return this._values.getTag(name)
  }

  /**
   * Sets a tag. The caller has to ensure that both name and value are not empty
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

  /**
   * Removes a tag with the specified name if it exists; otherwise, it does nothing.
   *
   * @param name - The name of the tag to be removed.
   * @returns this
   */
  public removeTag(name: string): Point {
    this._values.removeTag(name)
    return this
  }

  /**
   * Gets an array of tag names.
   *
   * @returns An array of tag names.
   */
  public getTagNames(): string[] {
    return this._values.getTagNames()
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
    return this._values.getFloatField(name)
  }

  /**
   * Sets a number field.
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
    return this._values.getIntegerField(name)
  }

  /**
   * Sets an integer field.
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
    return this._values.getUintegerField(name)
  }

  /**
   * Sets an unsigned integer field.
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
    return this._values.getStringField(name)
  }

  /**
   * Sets a string field.
   *
   * @param name - field name
   * @param value - field value
   * @returns this
   */
  public setStringField(name: string, value: string | any): Point {
    this._values.setStringField(name, value)
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
    return this._values.getBooleanField(name)
  }

  /**
   * Sets a boolean field.
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

  /**
   * Gets the type of field with given name, if it exists.
   * If the field is not present, returns undefined.
   *
   * @param name - field name
   * @returns The field type or undefined.
   */
  public getFieldType(name: string): PointFieldType | undefined {
    return this._values.getFieldType(name)
  }

  /**
   * Sets field based on provided type.
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
   * @param fields - name-value map
   * @returns this
   */
  public setFields(fields: {[key: string]: number | boolean | string}): Point {
    this._values.setFields(fields)
    return this
  }

  /**
   * Removes a field with the specified name if it exists; otherwise, it does nothing.
   *
   * @param name - The name of the field to be removed.
   * @returns this
   */
  public removeField(name: string): Point {
    this._values.removeField(name)
    return this
  }

  /**
   * Gets an array of field names associated with this object.
   *
   * @returns An array of field names.
   */
  public getFieldNames(): string[] {
    return this._values.getFieldNames()
  }

  /**
   * Checks if this object has any fields.
   *
   * @returns true if fields are present, false otherwise.
   */
  public hasFields(): boolean {
    return this._values.hasFields()
  }

  /**
   * Creates a copy of this object.
   *
   * @returns A new instance with same values.
   */
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
