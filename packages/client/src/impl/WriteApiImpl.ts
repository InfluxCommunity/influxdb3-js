import WriteApi from '../WriteApi'
import {DEFAULT_WriteOptions, WriteOptions} from '../options'
import {Transport, SendOptions} from '../transport'
import {Headers} from '../results'
import {Log} from '../util/logger'
import {HttpError} from '../errors'
import {Point} from '../Point'
import {currentTime, dateToProtocolTimestamp} from '../util/currentTime'
import {isDefined} from '../util/common'

export default class WriteApiImpl implements WriteApi {
  public path: string

  private closed = false
  private writeOptions: WriteOptions
  private sendOptions: SendOptions
  private currentTime: () => string
  private dateToProtocolTimestamp: (d: Date) => string

  constructor(
    private transport: Transport,
    bucket: string,
    writeOptions?: Partial<WriteOptions>,
    org?: string
  ) {
    this.writeOptions = {
      ...DEFAULT_WriteOptions,
      ...writeOptions,
    }
    this.path = this._createWritePath(bucket, org)
    const precision = this.writeOptions.precision
    this.currentTime = currentTime[precision]
    this.dateToProtocolTimestamp = dateToProtocolTimestamp[precision]
    this.sendOptions = {
      method: 'POST',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        ...writeOptions?.headers,
      },
      gzipThreshold: this.writeOptions.gzipThreshold,
    }

    this.doWrite = this.doWrite.bind(this)
    this.convertTime = this.convertTime.bind(this)
  }

  _createWritePath(bucket: string, org?: string) {
    const query: string[] = [
      `bucket=${encodeURIComponent(bucket)}`,
      `precision=${this.writeOptions.precision}`,
    ]
    if (org) query.push(`org=${encodeURIComponent(org)}`)
    const consistency = this.writeOptions?.consistency
    if (consistency)
      query.push(`consistency=${encodeURIComponent(consistency)}`)

    const path = `/api/v2/write?${query.join('&')}`
    return path
  }

  doWrite(lines: string[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: WriteApiImpl = this
    if (this.closed) {
      throw new Error('writeApi: already closed!')
    }
    if (this.closed || lines.length <= 0) return Promise.resolve()

    let resolve: (value: void | PromiseLike<void>) => void
    let reject: (reason?: any) => void
    const promise = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })

    let responseStatusCode: number | undefined
    const callbacks = {
      responseStarted(_headers: Headers, statusCode?: number): void {
        responseStatusCode = statusCode
      },
      error(error: Error): void {
        // ignore informational message about the state of InfluxDB
        // enterprise cluster, if present
        if (
          error instanceof HttpError &&
          error.json &&
          typeof error.json.error === 'string' &&
          error.json.error.includes('hinted handoff queue not empty')
        ) {
          Log.warn('Write to InfluxDB returns: ' + error.json.error)
          responseStatusCode = 204
          callbacks.complete()
          return
        }
        // retry if possible
        if (
          !self.closed &&
          (!(error instanceof HttpError) ||
            (error as HttpError).statusCode >= 429)
        ) {
          Log.warn(`Write to InfluxDB failed.`, error)
          reject(error)
          return
        }
        Log.error(`Write to InfluxDB failed.`, error)
        reject(error)
      },
      complete(): void {
        // older implementations of transport do not report status code
        if (responseStatusCode == 204 || responseStatusCode == undefined) {
          resolve()
        } else {
          const message = `204 HTTP response status code expected, but ${responseStatusCode} returned`
          const error = new HttpError(
            responseStatusCode,
            message,
            undefined,
            '0'
          )
          error.message = message
          callbacks.error(error)
        }
      },
    }
    this.transport.send(
      this.path,
      lines.join('\n'),
      this.sendOptions,
      callbacks
    )

    return promise
  }

  async write(lines: string | ArrayLike<string>): Promise<void> {
    await this.doWrite(typeof lines === 'string' ? [lines] : Array.from(lines))
  }

  async writePoint(point: Point): Promise<void> {
    await this.writePoints([point])
  }

  async writePoints(points: ArrayLike<Point>): Promise<void> {
    await this.doWrite(
      Array.from(points)
        .map((p) => p.toLineProtocol(this.convertTime))
        .filter(isDefined)
    )
  }

  async close(): Promise<void> {
    this.closed = true
  }

  convertTime(value: string | number | Date | undefined): string | undefined {
    if (value === undefined) {
      return this.currentTime()
    } else if (typeof value === 'string') {
      return value.length > 0 ? value : undefined
    } else if (value instanceof Date) {
      return this.dateToProtocolTimestamp(value)
    } else if (typeof value === 'number') {
      return String(Math.floor(value))
    } else {
      return String(value)
    }
  }
}
