import WriteApi from '../WriteApi'
import {
  DEFAULT_WriteOptions,
  WriteOptions,
  WritePrecisionType,
} from '../options'
import {Transport, SendOptions} from '../transport'
import {Headers} from '../results'
import {Log} from '../util/logger'
import {HttpError} from '../errors'
import {Point} from '../Point'
import {currentTime, dateToProtocolTimestamp} from '../util/currentTime'
import utf8Length from '../util/utf8Length'

class WriteBuffer {
  length = 0
  bytes = -1
  lines: string[]

  constructor(
    private maxChunkRecords: number,
    private maxBatchBytes: number,
    private flushFn: (lines: string[]) => Promise<void>,
    private scheduleSend: () => void
  ) {
    this.lines = new Array<string>(maxChunkRecords)
  }

  add(record: string): void {
    const size = utf8Length(record)
    if (this.length === 0) {
      this.scheduleSend()
    } else if (this.bytes + size + 1 >= this.maxBatchBytes) {
      // the new size already exceeds maxBatchBytes, send it
      this.flush().catch((_e) => {
        // an error is logged in case of failure, avoid UnhandledPromiseRejectionWarning
      })
    }
    this.lines[this.length] = record
    this.length++
    this.bytes += size + 1
    if (
      this.length >= this.maxChunkRecords ||
      this.bytes >= this.maxBatchBytes
    ) {
      this.flush().catch((_e) => {
        // an error is logged in case of failure, avoid UnhandledPromiseRejectionWarning
      })
    }
  }
  flush(): Promise<void> {
    const lines = this.reset()
    if (lines.length > 0) {
      return this.flushFn(lines)
    } else {
      return Promise.resolve()
    }
  }
  reset(): string[] {
    const retVal = this.lines.slice(0, this.length)
    this.length = 0
    this.bytes = -1 // lines are joined with \n
    return retVal
  }
}

export default class WriteApiImpl implements WriteApi {
  public path: string

  private writeBuffer: WriteBuffer
  private closed = false
  private writeOptions: WriteOptions
  private sendOptions: SendOptions
  private _timeoutHandle: any = undefined
  private currentTime: () => string
  private dateToProtocolTimestamp: (d: Date) => string

  constructor(
    private transport: Transport,
    bucket: string,
    precision: WritePrecisionType,
    writeOptions?: Partial<WriteOptions>,
    org?: string
  ) {
    const orgURI = org ? `org=${encodeURIComponent(org)}&` : ''
    this.path = `/api/v2/write?${orgURI}bucket=${encodeURIComponent(
      bucket
    )}&precision=${precision}`
    if (writeOptions?.consistency) {
      this.path += `&consistency=${encodeURIComponent(
        writeOptions.consistency
      )}`
    }
    this.writeOptions = {
      ...DEFAULT_WriteOptions,
      ...writeOptions,
    }
    this.currentTime = currentTime[precision]
    this.dateToProtocolTimestamp = dateToProtocolTimestamp[precision]
    if (this.writeOptions.defaultTags) {
      this.useDefaultTags(this.writeOptions.defaultTags)
    }
    this.sendOptions = {
      method: 'POST',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        ...writeOptions?.headers,
      },
      gzipThreshold: this.writeOptions.gzipThreshold,
    }

    const scheduleNextSend = (): void => {
      if (this.writeOptions.flushInterval > 0) {
        this._clearFlushTimeout()
        /* istanbul ignore else manually reviewed, hard to reproduce */
        if (!this.closed) {
          this._timeoutHandle = setTimeout(
            () =>
              this.sendBatch(this.writeBuffer.reset()).catch((_e) => {
                // an error is logged in case of failure, avoid UnhandledPromiseRejectionWarning
              }),
            this.writeOptions.flushInterval
          )
        }
      }
    }
    // write buffer
    this.writeBuffer = new WriteBuffer(
      this.writeOptions.batchSize,
      this.writeOptions.maxBatchBytes,
      (lines) => {
        this._clearFlushTimeout()
        return this.sendBatch(lines)
      },
      scheduleNextSend
    )
    this.sendBatch = this.sendBatch.bind(this)
  }

  sendBatch(lines: string[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: WriteApiImpl = this
    if (!this.closed && lines.length > 0) {
      return new Promise<void>((resolve, reject) => {
        let responseStatusCode: number | undefined
        const callbacks = {
          responseStarted(_headers: Headers, statusCode?: number): void {
            responseStatusCode = statusCode
          },
          error(error: Error): void {
            // call the writeFailed listener and check if we can retry
            const onRetry = self.writeOptions.writeFailed.call(
              self,
              error,
              lines
            )
            if (onRetry) {
              onRetry.then(resolve, reject)
              return
            }
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
              self.writeOptions.writeSuccess.call(self, lines)
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
      })
    } else {
      return Promise.resolve()
    }
  }

  private _clearFlushTimeout(): void {
    if (this._timeoutHandle !== undefined) {
      clearTimeout(this._timeoutHandle)
      this._timeoutHandle = undefined
    }
  }

  writeRecord(record: string): void {
    if (this.closed) {
      throw new Error('writeApi: already closed!')
    }
    this.writeBuffer.add(record)
  }
  writeRecords(records: ArrayLike<string>): void {
    if (this.closed) {
      throw new Error('writeApi: already closed!')
    }
    for (let i = 0; i < records.length; i++) {
      this.writeBuffer.add(records[i])
    }
  }
  writePoint(point: Point): void {
    if (this.closed) {
      throw new Error('writeApi: already closed!')
    }
    const line = point.toLineProtocol(this)
    if (line) this.writeBuffer.add(line)
  }
  writePoints(points: ArrayLike<Point>): void {
    if (this.closed) {
      throw new Error('writeApi: already closed!')
    }
    for (let i = 0; i < points.length; i++) {
      const line = points[i].toLineProtocol(this)
      if (line) this.writeBuffer.add(line)
    }
  }
  async flush(): Promise<void> {
    await this.writeBuffer.flush()
  }
  close(): Promise<void> {
    const retVal = this.writeBuffer.flush().finally(() => {
      this.closed = true
    })
    return retVal
  }
  dispose(): number {
    this._clearFlushTimeout()
    this.closed = true
    return this.writeBuffer.length
  }

  // PointSettings
  defaultTags: {[key: string]: string} | undefined
  useDefaultTags(tags: {[key: string]: string}): WriteApi {
    this.defaultTags = tags
    return this
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
