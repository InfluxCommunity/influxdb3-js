import WriteApi from './WriteApi'
import WriteApiImpl from './impl/WriteApiImpl'
import QueryApi from './QueryApi'
import QueryApiImpl from './impl/QueryApiImpl'
import {ClientOptions, QueryType, WriteOptions, fromConnectionString, fromEnv} from './options'
import {IllegalArgumentError} from './errors'
import {WritableData, writableDataToLineProtocol} from './util/generics'
import {throwReturn} from './util/common'
import {PointValues} from './PointValues'

const argumentErrorMessage = `\
Please specify the 'database' as a method parameter or use default configuration \
at 'ClientOptions.database'
`

/**
 * `InfluxDBClient` for interacting with an InfluxDB server, simplifying common operations such as writing, querying.
 */
export default class InfluxDBClient {
  private readonly _options: ClientOptions
  private readonly _writeApi: WriteApi
  private readonly _queryApi: QueryApi

  /**
   * Creates a new instance of the `InfluxDBClient` from `ClientOptions`.
   * @param options - client options
   */
  constructor(options: ClientOptions);

  /**
   * Creates a new instance of the `InfluxDBClient` from connection string.
   * @example https://us-east-1-1.aws.cloud2.influxdata.com/?token=my-token&database=my-database
   *
   * Supported query parameters:
   *   - token - authentication token (required)
   *   - database - database (bucket) name
   *   - timeout - I/O timeout
   *   - precision - timestamp precision when writing data
   *   - gzipThreshold - payload size threshold for gzipping data
   *
   * @param connectionString - connection string
   */
  constructor(connectionString: string);

  /**
   * Creates a new instance of the `InfluxDBClient` from environment variables.
   *
   * Supported variables:
   *   - INFLUX_HOST - cloud/server URL (required)
   *   - INFLUX_TOKEN - authentication token (required)
   *   - INFLUX_TIMEOUT - I/O timeout
   *   - INFLUX_DATABASE - database (bucket) name
   *   - INFLUX_PRECISION - timestamp precision when writing data
   *   - INFLUX_GZIP_THRESHOLD - payload size threshold for gzipping data
   */
  constructor();

  constructor(...args: Array<any>) {
    let options:ClientOptions
    switch(args.length) {
        case 0: {
            options = fromEnv()
          break;
        }
        case 1: {
          if (args [0] == null) {
            throw new IllegalArgumentError('No configuration specified!')
          } else if (typeof args[0] === "string") {
            options = fromConnectionString(args[0])
          } else {
            options = args[0]
          }
          break;
        }
        default: {
            throw new IllegalArgumentError('Multiple arguments specified!')
        }
    }
    this._options = options
    const host = this._options.host
    if (typeof host !== 'string')
        throw new IllegalArgumentError('No host specified!')
    if (host.endsWith('/'))
        this._options.host = host.substring(0, host.length - 1)
    if (typeof this._options.token !== 'string')
        throw new IllegalArgumentError('No token specified!')
    this._queryApi = new QueryApiImpl(this._options)
    this._writeApi = new WriteApiImpl(this._options)
  }

  private _mergeWriteOptions = (writeOptions?: Partial<WriteOptions>) => {
    return {
      ...this._options.writeOptions,
      ...writeOptions,
    }
  }

  /**
   * Write data into specified database.
   * @param data - data to write
   * @param database - database to write into
   * @param org - organization to write into
   * @param writeOptions - write options
   */
  async write(
    data: WritableData,
    database?: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    await this._writeApi.doWrite(
      writableDataToLineProtocol(data),
      database ??
        this._options.database ??
        throwReturn(new Error(argumentErrorMessage)),
      org,
      this._mergeWriteOptions(writeOptions)
    )
  }

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryType - The type of query (default: 'sql').
   * @returns An async generator that yields maps of string keys to any values.
   */
  query(
    query: string,
    database?: string,
    queryType: QueryType = 'sql'
  ): AsyncGenerator<Record<string, any>, void, void> {
    return this._queryApi.query(
      query,
      database ??
        this._options.database ??
        throwReturn(new Error(argumentErrorMessage)),
      queryType
    )
  }

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryType - The type of query (default: 'sql').
   * @returns An async generator that yields PointValues object.
   */
  queryPoints(
    query: string,
    database?: string,
    queryType: QueryType = 'sql'
  ): AsyncGenerator<PointValues, void, void> {
    return this._queryApi.queryPoints(
      query,
      database ??
        this._options.database ??
        throwReturn(new Error(argumentErrorMessage)),
      queryType
    )
  }

  /**
   * Closes the client and all its resources (connections, ...)
   */
  async close(): Promise<void> {
    await this._writeApi.close()
    await this._queryApi.close()
  }
}
