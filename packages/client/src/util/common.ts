type Defined<T> = Exclude<T, undefined>

/**
 * allows to throw error as expression
 */
export const throwReturn = <T>(err: Error): Defined<T> => {
  throw err
}

export const isDefined = <T>(value: T): value is Defined<T> =>
  value !== undefined

export const isArrayLike = <T>(value: any): value is ArrayLike<T> =>
  value instanceof Array ||
  (value instanceof Object &&
    typeof value.length === 'number' &&
    (value.length === 0 ||
      Object.getOwnPropertyNames(value).some((x) => x === '0')))

export const createInt32Uint8Array = (value: number): Uint8Array => {
  const bytes = new Uint8Array(4)
  bytes[0] = value >> (8 * 0)
  bytes[1] = value >> (8 * 1)
  bytes[2] = value >> (8 * 2)
  bytes[3] = value >> (8 * 3)
  return bytes
}

export const collectAll = async <T>(
  generator: AsyncGenerator<T, any, any>
): Promise<T[]> => {
  const results: T[] = []
  for await (const value of generator) {
    results.push(value)
  }
  return results
}
