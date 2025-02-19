import {parse} from 'url'
import * as http from 'http'
import * as https from 'https'
import {Buffer} from 'buffer'
import {RequestTimedOutError, AbortError, HttpError} from '../../errors'
import {Transport, SendOptions} from '../../transport'
import {
  Cancellable,
  CommunicationObserver,
  Headers,
  ResponseStartedFn,
} from '../../results'
import zlib from 'zlib'
import completeCommunicationObserver from '../completeCommunicationObserver'
import {CLIENT_LIB_USER_AGENT} from '../version'
import {Log} from '../../util/logger'
import {pipeline, Readable} from 'stream'
import {ConnectionOptions} from '../../options'

const zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH,
}
const emptyBuffer = Buffer.allocUnsafe(0)

class CancellableImpl implements Cancellable {
  private _cancelled = false
  public resume?: () => void
  cancel(): void {
    this._cancelled = true
    if (this.resume) {
      this.resume()
      this.resume = undefined
    }
  }
  isCancelled(): boolean {
    return this._cancelled
  }
}

/**
 * Transport layer on top of node http or https library.
 */
export class NodeHttpTransport implements Transport {
  private _defaultOptions: {[key: string]: any}
  private _requestApi: (
    options: http.RequestOptions,
    callback: (res: http.IncomingMessage) => void
  ) => http.ClientRequest
  private _contextPath: string
  private _token?: string
  private _authScheme?: string
  private _headers: Record<string, string>
  /**
   * Creates a node transport using for the client options supplied.
   * @param connectionOptions - connection options
   */
  constructor(connectionOptions: ConnectionOptions) {
    const {
      host: _url,
      proxyUrl,
      token,
      authScheme,
      transportOptions,
      ...nodeSupportedOptions
    } = connectionOptions
    const url = parse(proxyUrl || _url)
    this._token = token
    this._authScheme = authScheme
    this._defaultOptions = {
      ...nodeSupportedOptions,
      ...transportOptions,
      port: url.port,
      protocol: url.protocol,
      hostname: url.hostname,
    }
    this._contextPath = proxyUrl ? _url : url.path ?? ''
    if (this._contextPath.endsWith('/')) {
      this._contextPath = this._contextPath.substring(
        0,
        this._contextPath.length - 1
      )
    }
    // remove all undefined field to avoid node validation errors
    // https://github.com/influxdata/influxdb-client-js/issues/380
    Object.keys(this._defaultOptions).forEach(
      (key) =>
        this._defaultOptions[key] === undefined &&
        delete this._defaultOptions[key]
    )
    // https://github.com/influxdata/influxdb-client-js/issues/263
    // don't allow /api/v2 suffix to avoid future problems
    if (this._contextPath.endsWith('/api/v2')) {
      Log.warn(
        `Please remove '/api/v2' context path from InfluxDB base url, using ${url.protocol}//${url.hostname}:${url.port} !`
      )
      this._contextPath = ''
    }

    if (url.protocol === 'http:') {
      this._requestApi =
        this._defaultOptions['follow-redirects']?.http?.request ?? http.request
    } else if (url.protocol === 'https:') {
      this._requestApi =
        this._defaultOptions['follow-redirects']?.https?.request ??
        https.request
    } else {
      throw new Error(
        `Unsupported protocol "${url.protocol} in URL: "${connectionOptions.host}"`
      )
    }
    this._headers = {
      'User-Agent': CLIENT_LIB_USER_AGENT,
      ...connectionOptions.headers,
    }
    if (proxyUrl) {
      this._headers['Host'] = parse(_url).host as string
    }
  }

  /**
   * Sends data to server and receives communication events via communication callbacks.
   *
   * @param path - HTTP request  path
   * @param body - message body
   * @param options
   * @param callbacks - communication callbacks
   */
  send(
    path: string,
    body: string,
    options: SendOptions,
    callbacks?: Partial<CommunicationObserver<any>>
  ): void {
    const cancellable = new CancellableImpl()
    if (callbacks && callbacks.useCancellable)
      callbacks.useCancellable(cancellable)
    this._createRequestMessage(
      path,
      body,
      options,
      (message: {[key: string]: any}) => {
        this._request(message, cancellable, callbacks)
      },
      /* istanbul ignore next - hard to simulate failure, manually reviewed */
      (err: Error) => callbacks?.error && callbacks.error(err)
    )
  }

  /**
   * Sends data to the server and receives decoded result. The type of the result depends on
   * response's content-type (deserialized json, text).

   * @param path - HTTP path
   * @param body
   * @param options - send options
   * @param responseStarted
   * @returns Promise of response body
   */
  request(
    path: string,
    body: any,
    options: SendOptions,
    responseStarted?: ResponseStartedFn
  ): Promise<any> {
    if (!body) {
      body = ''
    } else if (typeof body !== 'string') {
      body = JSON.stringify(body)
    }
    let buffer = emptyBuffer
    let contentType: string
    let responseStatusCode: number | undefined
    return new Promise((resolve, reject) => {
      this.send(path, body as string, options, {
        responseStarted(headers: Headers, statusCode?: number) {
          if (responseStarted) {
            responseStarted(headers, statusCode)
          }
          contentType = String(headers['content-type'])
          responseStatusCode = statusCode
        },
        next: (data: Uint8Array): void => {
          buffer = Buffer.concat([buffer, data])
        },
        complete: (): void => {
          const responseType = options.headers?.accept ?? contentType
          try {
            if (responseStatusCode === 204) {
              // ignore body of NO_CONTENT response
              resolve(undefined)
            }
            if (responseType.includes('json')) {
              if (buffer.length) {
                resolve(JSON.parse(buffer.toString('utf8')))
              } else {
                resolve(undefined)
              }
            } else if (
              responseType.includes('text') ||
              responseType.startsWith('application/csv')
            ) {
              resolve(buffer.toString('utf8'))
            } else {
              resolve(buffer)
            }
          } catch (e) {
            reject(e)
          }
        },
        error: (e: Error): void => {
          reject(e)
        },
      })
    })
  }

  async *iterate(
    path: string,
    body: string,
    options: SendOptions
  ): AsyncIterableIterator<Uint8Array> {
    let terminationError: Error | undefined = undefined
    let nestedReject: (e: Error) => void
    function wrapReject(error: Error) {
      terminationError = error
      nestedReject(error)
    }
    const requestMessage = await new Promise<Record<string, any>>(
      (resolve, reject) => {
        nestedReject = reject
        this._createRequestMessage(path, body, options, resolve, wrapReject)
      }
    )
    if (requestMessage.signal?.addEventListener) {
      ;(requestMessage.signal as AbortSignal).addEventListener('abort', () => {
        wrapReject(new AbortError())
      })
    }
    const response = await new Promise<http.IncomingMessage>(
      (resolve, reject) => {
        nestedReject = reject
        const req = this._requestApi(requestMessage, resolve)
        req.on('timeout', () => wrapReject(new RequestTimedOutError()))
        req.on('error', wrapReject)

        req.write(requestMessage.body)
        req.end()
      }
    )
    const res = await new Promise<Readable>((resolve, reject) => {
      nestedReject = reject
      this._prepareResponse(response, resolve, wrapReject)
    })
    for await (const chunk of res) {
      if (terminationError) {
        throw terminationError
      }
      yield chunk
    }
  }
  /**
   * Creates configuration for a specific request.
   *
   * @param path - API path starting with '/' and containing also query parameters
   * @param body - request body, will be utf-8 encoded
   * @returns a configuration object that is suitable for making the request
   */
  private _createRequestMessage(
    path: string,
    body: string,
    sendOptions: SendOptions,
    resolve: (req: http.RequestOptions) => void,
    reject: (err: Error) => void
  ): void {
    const bodyBuffer = Buffer.from(body, 'utf-8')
    const headers: {[key: string]: any} = {
      'content-type': 'application/json; charset=utf-8',
      ...this._headers,
    }
    if (this._token) {
      const authScheme = this._authScheme ?? 'Token'
      headers.authorization = `${authScheme} ${this._token}`
    }
    const options: {[key: string]: any} = {
      ...this._defaultOptions,
      path: this._contextPath + path,
      method: sendOptions.method,
      headers: {
        ...headers,
        ...sendOptions.headers,
      },
    }
    if (sendOptions.signal) {
      options.signal = sendOptions.signal
    }
    if (
      sendOptions.gzipThreshold !== undefined &&
      sendOptions.gzipThreshold < bodyBuffer.length
    ) {
      zlib.gzip(bodyBuffer, (err, res) => {
        /* istanbul ignore next - hard to simulate failure, manually reviewed */
        if (err) {
          return reject(err)
        }
        options.headers['content-encoding'] = 'gzip'
        options.body = res
        resolve(options)
      })
      return
    }
    options.body = bodyBuffer
    options.headers['content-length'] = options.body.length
    resolve(options)
  }

  private _prepareResponse(
    res: http.IncomingMessage,
    resolve: (res: Readable) => void,
    reject: (err: Error) => void
  ) {
    res.on('aborted', () => {
      reject(new AbortError())
    })
    res.on('error', reject)
    /* istanbul ignore next statusCode is optional in http.IncomingMessage */
    const statusCode = res.statusCode ?? 600
    const contentEncoding = res.headers['content-encoding']
    let responseData
    if (contentEncoding === 'gzip') {
      responseData = zlib.createGunzip(zlibOptions)
      responseData = pipeline(res, responseData, (e) => e && reject(e))
    } else {
      responseData = res
    }
    if (statusCode >= 300) {
      let body = ''
      const isJson = String(res.headers['content-type']).startsWith(
        'application/json'
      )
      responseData.on('data', (s) => {
        body += s.toString()
        if (!isJson && body.length > 1000) {
          body = body.slice(0, 1000)
          res.resume()
        }
      })
      responseData.on('end', () => {
        if (body === '' && !!res.headers['x-influxdb-error']) {
          body = res.headers['x-influxdb-error'].toString()
        }
        reject(
          new HttpError(
            statusCode,
            res.statusMessage,
            body,
            res.headers['content-type'],
            res.headers
          )
        )
      })
    } else {
      resolve(responseData)
    }
  }

  private _request(
    requestMessage: {[key: string]: any},
    cancellable: CancellableImpl,
    callbacks?: Partial<CommunicationObserver<any>>
  ): void {
    const listeners = completeCommunicationObserver(callbacks)
    if (cancellable.isCancelled()) {
      listeners.complete()
      return
    }
    if (requestMessage.signal?.addEventListener) {
      ;(requestMessage.signal as AbortSignal).addEventListener('abort', () => {
        listeners.error(new AbortError())
      })
    }
    const req = this._requestApi(
      requestMessage,
      (res: http.IncomingMessage) => {
        /* istanbul ignore next - hard to simulate failure, manually reviewed */
        if (cancellable.isCancelled()) {
          res.resume()
          listeners.complete()
          return
        }
        listeners.responseStarted(res.headers, res.statusCode)
        this._prepareResponse(
          res,
          (responseData) => {
            responseData.on('data', (data) => {
              if (cancellable.isCancelled()) {
                res.resume()
              } else {
                if (listeners.next(data) === false) {
                  // pause processing, the consumer signalizes that
                  // it is not able to receive more data
                  if (!listeners.useResume) {
                    listeners.error(
                      new Error('Unable to pause, useResume is not configured!')
                    )
                    res.resume()
                    return
                  }
                  res.pause()
                  const resume = () => {
                    res.resume()
                  }
                  cancellable.resume = resume
                  listeners.useResume(resume)
                }
              }
            })
            responseData.on('end', listeners.complete)
          },
          listeners.error
        )
      }
    )
    // Support older Nodes which don't allow `timeout` in the
    // request options
    /* istanbul ignore else support older node versions */
    if (typeof req.setTimeout === 'function' && requestMessage.timeout) {
      req.setTimeout(requestMessage.timeout)
    }

    req.on('timeout', () => {
      listeners.error(new RequestTimedOutError())
    })
    req.on('error', (error) => {
      listeners.error(error)
    })

    /* istanbul ignore else support older node versions */
    if (requestMessage.body) {
      req.write(requestMessage.body)
    }
    req.end()
  }
}
export default NodeHttpTransport
