import {Point} from './Point'

export interface TimeConverter {
  (value: string | number | Date | undefined): string | undefined
}

/**
 * Asynchronous API that writes time-series data into InfluxDB.
 * This API always sends data to InfluxDB immediately
 */
export default interface WriteApi {
  /**
   * Write lines of [Line Protocol](https://bit.ly/2QL99fu).
   *
   * @param records - lines in InfluxDB Line Protocol
   */
  write(records: string | Array<string>): Promise<void>

  /**
   * Write point.
   *
   * @param point - point to write
   */
  writePoint(point: Point): Promise<void>

  /**
   * Write points.
   *
   * @param points - points to write
   */
  writePoints(points: ArrayLike<Point>): Promise<void>

  /**
   * @returns completition promise
   */
  close(): Promise<void>

  /**
   * HTTP path and query parameters of InfluxDB query API. It is
   * automatically initialized to `/api/v2/write?org=...`,
   * but it can be changed after the API is obtained.
   */
  path: string

  /** convertTime serializes Point's timestamp to a line protocol value */
  convertTime?: TimeConverter
}
