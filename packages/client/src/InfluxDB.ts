import WriteApi from './WriteApi'
import {Transport} from './transport'
import WriteApiImpl from './impl/WriteApiImpl'
// replaced by ./impl/browser/FetchTransport in browser builds
import TransportImpl from './impl/node/NodeHttpTransport'
import {ClientOptions, WriteOptions} from './options'
import {IllegalArgumentError} from './errors'
/**
 * InfluxDB's entry point that configures communication with InfluxDB 3 server and provide APIs to write and query data.
 */
export default class InfluxDBClient {
  private readonly _options: ClientOptions
  readonly transport: Transport

  /**
   * Creates influxdb client options from an options object or url.
   * @param options - client options
   */
  constructor(options: ClientOptions | string) {
    if (typeof options === 'string') {
      this._options = {url: options}
    } else if (options !== null && typeof options === 'object') {
      this._options = options
    } else {
      throw new IllegalArgumentError('No url or configuration specified!')
    }
    const url = this._options.url
    if (typeof url !== 'string')
      throw new IllegalArgumentError('No url specified!')
    if (url.endsWith('/')) this._options.url = url.substring(0, url.length - 1)
    this.transport = this._options.transport ?? new TransportImpl(this._options)
  }

  /**
   * Creates WriteApi for the supplied organization and bucket.
   *
   * @remarks
   * Use {@link WriteOptions} to customize retry strategy options, data chunking
   * and flushing options. See {@link DEFAULT_WriteOptions} to see the defaults.
   *
   * See also {@link https://github.com/influxdata/influxdb-client-js/blob/master/examples/write.mjs | write example},
   * {@link https://github.com/influxdata/influxdb-client-js/blob/master/examples/writeAdvanced.mjs | writeAdvanced example},
   * and {@link https://github.com/influxdata/influxdb-client-js/blob/master/examples/index.html | browser example}.
   *
   * @param org - Specifies the destination organization for writes. Takes either the ID or Name interchangeably.
   * @param bucket - The destination bucket for writes.
   * @param writeOptions - Custom write options.
   * @returns WriteApi instance
   */
  getWriteApi(bucket: string, writeOptions?: Partial<WriteOptions>): WriteApi {
    return new WriteApiImpl(
      this.transport,
      bucket,
      writeOptions ?? this._options.writeOptions
    )
  }
}
