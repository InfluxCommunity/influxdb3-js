import WriteApi from './WriteApi'
import {Transport} from './transport'
import WriteApiImpl from './impl/WriteApiImpl'
// replaced by ./impl/browser/FetchTransport in browser builds
import TransportImpl from './impl/node/NodeHttpTransport'
import {ClientOptions, QueryType, WriteOptions} from './options'
import {IllegalArgumentError} from './errors'
import QueryApi from './QueryApi'
import QueryApiImpl from './impl/QueryApiImpl'
import {WritableData, writableDataToLineProtocol} from './util/generics'

export default class InfluxDBClient {
  private readonly _options: ClientOptions
  private readonly _writeApi: WriteApi
  private readonly _queryApi: QueryApi
  readonly transport: Transport

  /**
   * Creates a new instance of the `InfluxDBClient` for interacting with an InfluxDB server, simplifying common operations such as writing, querying.
   * @param options - client options
   */
  constructor(options: ClientOptions) {
    if (options === undefined || options === null)
      throw new IllegalArgumentError('No configuration specified!')
    this._options = options
    const url = this._options.url
    if (typeof url !== 'string')
      throw new IllegalArgumentError('No url specified!')
    if (url.endsWith('/')) this._options.url = url.substring(0, url.length - 1)
    this._queryApi = new QueryApiImpl(this._options)
    this.transport = this._options.transport ?? new TransportImpl(this._options)
    this._writeApi = new WriteApiImpl(this.transport)
  }

  private _mergeWriteOptions = (writeOptions?: Partial<WriteOptions>) => {
    return {
      ...this._options.writeOptions,
      ...writeOptions,
    }
  }

  async write(
    data: WritableData,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    await this._writeApi.doWrite(
      writableDataToLineProtocol(data),
      database,
      org,
      this._mergeWriteOptions(writeOptions)
    )
  }

  query(
    database: string,
    query: string,
    queryType: QueryType = 'sql'
  ): AsyncGenerator<Record<string, any>, void, void> {
    return this._queryApi.query(database, query, queryType)
  }

  async close(): Promise<void> {
    await this._writeApi.close()
    await this._queryApi.close()
  }
}
