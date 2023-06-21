import WriteApi from '../WriteApi'
import {DEFAULT_WriteOptions, WriteOptions} from '../options'
import {Transport} from '../transport'
import {Headers} from '../results'
import {Log} from '../util/logger'
import {HttpError} from '../errors'

export default class WriteApiImpl implements WriteApi {
  private closed = false

  constructor(private transport: Transport) {
    this.doWrite = this.doWrite.bind(this)
  }

  _createWritePath(bucket: string, writeOptions: WriteOptions, org?: string) {
    const query: string[] = [
      `bucket=${encodeURIComponent(bucket)}`,
      `precision=${writeOptions.precision}`,
    ]
    if (org) query.push(`org=${encodeURIComponent(org)}`)
    const consistency = writeOptions?.consistency
    if (consistency)
      query.push(`consistency=${encodeURIComponent(consistency)}`)

    const path = `/api/v2/write?${query.join('&')}`
    return path
  }

  doWrite(
    bucket: string,
    lines: string[],
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: WriteApiImpl = this
    if (self.closed) {
      return Promise.reject(new Error('writeApi: already closed!'))
    }
    if (lines.length <= 0 || (lines.length === 1 && lines[0] === ''))
      return Promise.resolve()

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

    const writeOptionsOrDefault: WriteOptions = {
      ...DEFAULT_WriteOptions,
      ...writeOptions,
    }
    const sendOptions = {
      method: 'POST',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        ...writeOptions?.headers,
      },
      gzipThreshold: writeOptionsOrDefault.gzipThreshold,
    }

    this.transport.send(
      this._createWritePath(bucket, writeOptionsOrDefault, org),
      lines.join('\n'),
      sendOptions,
      callbacks
    )

    return promise
  }

  async close(): Promise<void> {
    this.closed = true
  }
}
