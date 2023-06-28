import {Point, PointRecord} from '../Point'
import {isArrayLike, isDefined} from './common'

/** Prevents confusion with the ArrayLike type. Use with PointRecord */
export type NotArrayLike<T> = T & {length?: string}

/** Prevents confusion with the PointRecord type. */
export type NotPointRecord<T> = T & {measurement?: void}

/**
 * The `WritableData` type represents different types of data that can be written.
 * The data can either be a uniform ArrayLike collection or a single value of the following types:
 *
 * - `Point`: Represents a {@link Point} object.
 *
 * - `string`: Represents lines of the [Line Protocol](https://bit.ly/2QL99fu).
 *
 * - `PointRecord`: Represents an anonymous object. Note that a single `PointRecord`
 *   should not have a property of name length, as it could be misinterpreted as ArrayLike.
 *   If unsure, encapsulate your record in an array, i.e. [record].
 */
export type WritableData =
  | NotPointRecord<
      ArrayLike<string> | ArrayLike<Point> | ArrayLike<PointRecord>
    >
  | NotArrayLike<PointRecord>
  | string
  | Point

export const writableDataToLineProtocol = (data: WritableData): string[] => {
  const arrayData = (
    isArrayLike(data) && typeof data !== 'string'
      ? Array.from(data as any)
      : [data]
  ) as string[] | Point[] | PointRecord[]
  if (arrayData.length === 0) return []

  const isLine = typeof arrayData[0] === 'string'
  const isPoint = arrayData[0] instanceof Point

  return isLine
    ? (arrayData as string[])
    : (isPoint
        ? (arrayData as Point[])
        : (arrayData as PointRecord[]).map(Point.fromRecord)
      )
        .map((p) => p.toLineProtocol())
        .filter(isDefined)
}
