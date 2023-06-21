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
   */
  doWrite(
    bucket: string,
    lines: string[],
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void>

  /**
   * @returns completition promise
   */
  close(): Promise<void>
}
