import {Point} from '../Point'
import {isArrayLike, isDefined} from './common'
import {WritePrecision} from '../options'

/**
 * The `WritableData` type represents different types of data that can be written.
 * The data can either be a uniform ArrayLike collection or a single value of the following types:
 *
 * - `Point`: Represents a {@link Point} object.
 *
 * - `string`: Represents lines of the [Line Protocol](https://bit.ly/2QL99fu).
 */
export type WritableData = ArrayLike<string> | ArrayLike<Point> | string | Point

/**
 * Convert `WritableData` to an array of lines of
 * [Line Protocol](https://bit.ly/2QL99fu)).
 * If the data is an array of `Point` objects, it will be converted to lines of
 * Line Protocol. If the data is a single `Point` object, it will be converted
 * to a single line of Line Protocol. If the data is an array of lines of
 * Line Protocol, it will be returned as is.
 *
 * @param data - data to write
 * @param defaultTags - the default tags to apply to all points.
 * @param tagOrder - preferred order of tags in line protocol serialization.
 * Tags listed here are written first, in the same order.
 * The remaining tags are appended in lexicographical order.
 * This helps control first-write column order in InfluxDB 3.
 * @param precision - the writing precision. It is used as the time precision
 * when serializing Point instances whose timestamp is a Date
 */
export const writableDataToLineProtocol = (
  data: WritableData,
  defaultTags?: {[key: string]: string},
  tagOrder?: string[],
  precision?: WritePrecision
): string[] => {
  const arrayData = (
    isArrayLike(data) && typeof data !== 'string'
      ? Array.from(data as any)
      : [data]
  ) as string[] | Point[]
  if (arrayData.length === 0) return []

  const isLine = typeof arrayData[0] === 'string'

  return isLine
    ? (arrayData as string[])
    : (arrayData as Point[])
        .map((p) => {
          return p.getTimestamp() instanceof Date ||
            p.getTimestamp() === undefined
            ? p.toLineProtocol(precision, defaultTags, tagOrder)
            : p.toLineProtocol(undefined, defaultTags, tagOrder)
        })
        .filter(isDefined)
}
