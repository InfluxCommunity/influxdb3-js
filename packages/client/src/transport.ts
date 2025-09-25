import {CommunicationObserver, ResponseStartedFn} from './results'
/**
 * Options for sending a request message.
 */
export interface SendOptions {
  /** HTTP method (POST, PUT, GET, PATCH ...) */
  method: string
  /** Request HTTP headers. */
  headers?: {[key: string]: string}
  /** When specified, message body larger than the treshold is gzipped  */
  gzipThreshold?: number
  /** Abort signal */
  signal?: AbortSignal
}

/**
 * Simpified platform-neutral transport layer for communication with InfluxDB.
 */
export interface Transport {
  /**
   * Send data to the server and receive communication events via callbacks.
   *
   * @param path - HTTP request path
   * @param requestBody - HTTP request body
   * @param options  - send options
   * @param callbacks - communication callbacks to received data in Uint8Array
   * @param timeout - timeout of the request
   */
  send(
    path: string,
    requestBody: string,
    options: SendOptions,
    callbacks?: Partial<CommunicationObserver<Uint8Array>>,
    timeout?: number
  ): void

  /**
   * Sends data to the server and receives decoded result. The type of the result depends on
   * response's content-type (deserialized json, text).

   * @param path - HTTP request path
   * @param requestBody - request body
   * @param options - send options
   * @param responseStarted
   * @param timeout - timeout of the request
   * @returns response data
   */
  request(
    path: string,
    requestBody: any,
    options: SendOptions,
    responseStarted?: ResponseStartedFn,
    timeout?: number
  ): Promise<any>

  /**
   * Sends requestBody and returns response chunks in an async iterable
   * that can be easily consumed in an `for-await` loop.
   *
   * @param path - HTTP request path
   * @param requestBody - request body
   * @param options - send options
   * @param timeout - timeout of the request
   * @returns async iterable
   */
  iterate(
    path: string,
    requestBody: any,
    options: SendOptions,
    timeout?: number
  ): AsyncIterableIterator<Uint8Array>
}
