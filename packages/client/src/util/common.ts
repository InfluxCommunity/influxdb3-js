export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined

export const isArrayLike = <T>(value: any): value is ArrayLike<T> =>
  value instanceof Array ||
  (value instanceof Object &&
    typeof value.length === 'number' &&
    (value.length === 0 ||
      Object.getOwnPropertyNames(value).some((x) => x === '0')))

export const createInt32Uint8Array = (value: number) => {
  const bytes = new Uint8Array(4)
  bytes[0] = value >> (8 * 0)
  bytes[1] = value >> (8 * 1)
  bytes[2] = value >> (8 * 2)
  bytes[3] = value >> (8 * 3)
  return bytes
}
