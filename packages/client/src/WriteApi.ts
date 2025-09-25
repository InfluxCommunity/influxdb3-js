import {WriteOptions} from './options'

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
   * @param lines - InfluxDB Line Protocol
   * @param bucket
   * @param org
   * @param writeOptions
   * @param timeout - timeout of the request
   */
  doWrite(
    lines: string[],
    bucket: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>,
    timeout?: number
  ): Promise<void>

  /**
   * @returns completition promise
   */
  close(): Promise<void>
}
