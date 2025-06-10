import WriteApi from '../WriteApi'
import {
  ClientOptions,
  DEFAULT_WriteOptions,
  precisionToV2ApiString,
  precisionToV3ApiString,
  WriteOptions,
} from '../options'
import {Transport} from '../transport'
import {Headers} from '../results'
import {Log} from '../util/logger'
import {HttpError} from '../errors'
import {impl} from './implSelector'

export default class WriteApiImpl implements WriteApi {
  private _closed = false
  private _transport: Transport

  constructor(private _options: ClientOptions) {
    this._transport =
      this._options.transport ?? impl.writeTransport(this._options)
    this.doWrite = this.doWrite.bind(this)
  }

  private _createWritePath(
    bucket: string,
    writeOptions: WriteOptions,
    org?: string
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const precision = writeOptions.precision ?? DEFAULT_WriteOptions.precision!

    let path: string
    const query: string[] = []
    if (org) query.push(`org=${encodeURIComponent(org)}`)
    if (writeOptions.noSync) {
      // Setting no_sync=true is supported only in the v3 API.
      path = `/api/v3/write_lp`
      query.push(`db=${encodeURIComponent(bucket)}`)
      query.push(`precision=${precisionToV3ApiString(precision)}`)
      query.push(`no_sync=true`)
    } else {
      // By default, use the v2 API.
      path = `/api/v2/write`
      query.push(`bucket=${encodeURIComponent(bucket)}`)
      query.push(`precision=${precisionToV2ApiString(precision)}`)
    }

    return `${path}?${query.join('&')}`
  }

  doWrite(
    lines: string[],
    bucket: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: WriteApiImpl = this
    if (self._closed) {
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

    const writeOptionsOrDefault: WriteOptions = {
      ...DEFAULT_WriteOptions,
      ...writeOptions,
    }

    let responseStatusCode: number | undefined
    let headers: Headers
    const callbacks = {
      responseStarted(_headers: Headers, statusCode?: number): void {
        responseStatusCode = statusCode
        headers = _headers
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
          Log.warn(`Write to InfluxDB returns: ${error.json.error}`)
          responseStatusCode = 204
          callbacks.complete()
          return
        }
        if (
          error instanceof HttpError &&
          error.statusCode == 405 &&
          writeOptionsOrDefault.noSync
        ) {
          error = new HttpError(
            error.statusCode,
            "Server doesn't support write with noSync=true " +
              '(supported by InfluxDB 3 Core/Enterprise servers only).',
            error.body,
            error.contentType,
            error.headers
          )
        }
        Log.error(`Write to InfluxDB failed.`, error)
        reject(error)
      },
      complete(): void {
        // older implementations of transport do not report status code
        if (
          responseStatusCode == undefined ||
          (responseStatusCode >= 200 && responseStatusCode < 300)
        ) {
          resolve()
        } else {
          const message = `2xx HTTP response status code expected, but ${responseStatusCode} returned`
          const error = new HttpError(
            responseStatusCode,
            message,
            undefined,
            '0',
            headers
          )
          error.message = message
          callbacks.error(error)
        }
      },
    }

    const sendOptions = {
      method: 'POST',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        ...writeOptions?.headers,
      },
      gzipThreshold: writeOptionsOrDefault.gzipThreshold,
    }

    this._transport.send(
      this._createWritePath(bucket, writeOptionsOrDefault, org),
      lines.join('\n'),
      sendOptions,
      callbacks
    )

    return promise
  }

  async close(): Promise<void> {
    this._closed = true
  }
}
