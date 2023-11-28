import {Point} from '../Point'
import {isArrayLike, isDefined} from './common'

/**
 * The `WritableData` type represents different types of data that can be written.
 * The data can either be a uniform ArrayLike collection or a single value of the following types:
 *
 * - `Point`: Represents a {@link Point} object.
 *
 * - `string`: Represents lines of the [Line Protocol](https://bit.ly/2QL99fu).
 */
export type WritableData = ArrayLike<string> | ArrayLike<Point> | string | Point

export const writableDataToLineProtocol = (
  data: WritableData,
  defaultTags?: {[key: string]: string}
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
        .map((p) => p.toLineProtocol(undefined, defaultTags))
        .filter(isDefined)
}
