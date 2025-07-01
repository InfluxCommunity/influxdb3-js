import WriteApi from './WriteApi'
import WriteApiImpl from './impl/WriteApiImpl'
import QueryApi, {QParamType} from './QueryApi'
import QueryApiImpl from './impl/QueryApiImpl'
import {
  ClientOptions,
  DEFAULT_ConnectionOptions,
  DEFAULT_QueryOptions,
  QueryOptions,
  // QueryType,
  WriteOptions,
  fromConnectionString,
  fromEnv,
} from './options'
import {IllegalArgumentError} from './errors'
import {WritableData, writableDataToLineProtocol} from './util/generics'
import {throwReturn} from './util/common'
import {PointValues} from './PointValues'
import {Transport} from './transport'
import {impl} from './impl/implSelector'

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
  private readonly _transport: Transport

  /**
   * Creates a new instance of the `InfluxDBClient` from `ClientOptions`.
   * @param options - client options
   */
  constructor(options: ClientOptions)

  /**
   * Creates a new instance of the `InfluxDBClient` from connection string.
   * @example https://us-east-1-1.aws.cloud2.influxdata.com/?token=my-token&database=my-database
   *
   * Supported query parameters:
   *   - token - authentication token (required)
   *   - authScheme - token authentication scheme. Not set for Cloud access, set to 'Bearer' for Edge.
   *   - database - database (bucket) name
   *   - timeout - I/O timeout
   *   - precision - timestamp precision when writing data
   *   - gzipThreshold - payload size threshold for gzipping data
   *   - writeNoSync - skip waiting for WAL persistence on write
   *
   * @param connectionString - connection string
   */
  constructor(connectionString: string)

  /**
   * Creates a new instance of the `InfluxDBClient` from environment variables.
   *
   * Supported variables:
   *   - INFLUX_HOST - cloud/server URL (required)
   *   - INFLUX_TOKEN - authentication token (required)
   *   - INFLUX_AUTH_SCHEME - token authentication scheme. Not set for Cloud access, set to 'Bearer' for Edge.
   *   - INFLUX_TIMEOUT - I/O timeout
   *   - INFLUX_DATABASE - database (bucket) name
   *   - INFLUX_PRECISION - timestamp precision when writing data
   *   - INFLUX_GZIP_THRESHOLD - payload size threshold for gzipping data
   *   - INFLUX_WRITE_NO_SYNC - skip waiting for WAL persistence on write
   */
  constructor()

  constructor(...args: Array<any>) {
    let options: ClientOptions
    switch (args.length) {
      case 0: {
        options = fromEnv()
        break
      }
      case 1: {
        if (args[0] == null) {
          throw new IllegalArgumentError('No configuration specified!')
        } else if (typeof args[0] === 'string') {
          options = fromConnectionString(args[0])
        } else {
          options = args[0]
        }
        break
      }
      default: {
        throw new IllegalArgumentError('Multiple arguments specified!')
      }
    }
    this._options = {
      ...DEFAULT_ConnectionOptions,
      ...options,
    }
    const host = this._options.host
    if (typeof host !== 'string')
      throw new IllegalArgumentError('No host specified!')
    if (host.endsWith('/'))
      this._options.host = host.substring(0, host.length - 1)
    if (typeof this._options.token !== 'string')
      throw new IllegalArgumentError('No token specified!')
    this._queryApi = new QueryApiImpl(this._options)

    this._transport = impl.writeTransport(this._options)
    this._writeApi = new WriteApiImpl({
      transport: this._transport,
      ...this._options,
    })
  }

  private _mergeWriteOptions = (writeOptions?: Partial<WriteOptions>) => {
    const headerMerge: Record<string, string> = {
      ...this._options.writeOptions?.headers,
      ...writeOptions?.headers,
    }
    const result = {
      ...this._options.writeOptions,
      ...writeOptions,
    }
    result.headers = headerMerge
    return result
  }

  private _mergeQueryOptions = (queryOptions?: Partial<QueryOptions>) => {
    const headerMerge: Record<string, string> = {
      ...this._options.queryOptions?.headers,
      ...queryOptions?.headers,
    }
    const paramsMerge: Record<string, QParamType> = {
      ...this._options.queryOptions?.params,
      ...queryOptions?.params,
    }
    const result = {
      ...this._options.queryOptions,
      ...queryOptions,
    }
    result.headers = headerMerge
    result.params = paramsMerge
    return result
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
    const options = this._mergeWriteOptions(writeOptions)

    await this._writeApi.doWrite(
      writableDataToLineProtocol(data, options?.defaultTags),
      database ??
        this._options.database ??
        throwReturn(new Error(argumentErrorMessage)),
      org,
      options
    )
  }

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryOptions - The options for the query (default: \{ type: 'sql' \}).
   * @example
   * ```typescript
   *    client.query('SELECT * from net', 'traffic_db', {
   *       type: 'sql',
   *       headers: {
   *         'channel-pref': 'eu-west-7',
   *         'notify': 'central',
   *       },
   *     })
   * ```
   * @returns An async generator that yields maps of string keys to any values.
   */
  query(
    query: string,
    database?: string,
    queryOptions: Partial<QueryOptions> = this._options.queryOptions ??
      DEFAULT_QueryOptions
  ): AsyncGenerator<Record<string, any>, void, void> {
    const options = this._mergeQueryOptions(queryOptions)
    return this._queryApi.query(
      query,
      database ??
        this._options.database ??
        throwReturn(new Error(argumentErrorMessage)),
      options as QueryOptions
    )
  }

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryOptions - The type of query (default: \{type: 'sql'\}).
   * @example
   *
   * ```typescript
   * client.queryPoints('SELECT * FROM cpu', 'performance_db', {
   *       type: 'sql',
   *       params: {register: 'rax'},
   *     })
   * ```
   *
   * @returns An async generator that yields PointValues object.
   */
  queryPoints(
    query: string,
    database?: string,
    queryOptions: Partial<QueryOptions> = this._options.queryOptions ??
      DEFAULT_QueryOptions
  ): AsyncGenerator<PointValues, void, void> {
    const options = this._mergeQueryOptions(queryOptions)
    return this._queryApi.queryPoints(
      query,
      database ??
        this._options.database ??
        throwReturn(new Error(argumentErrorMessage)),
      options as QueryOptions
    )
  }

  /**
   * Retrieves the server version by making a request to the `/ping` endpoint.
   * It attempts to return the version information from the response headers or the response body.
   *
   * @return {Promise<string | undefined>} A promise that resolves to the server version as a string, or undefined if it cannot be determined.
   * Rejects the promise if an error occurs during the request.
   */
  async getServerVersion(): Promise<string | undefined> {
    let version = undefined
    try {
      const responseBody = await this._transport.request(
        '/ping',
        null,
        {
          method: 'GET',
        },
        (headers, _) => {
          version =
            headers['X-Influxdb-Version'] ?? headers['x-influxdb-version']
        }
      )
      if (responseBody && !version) {
        version = responseBody['version']
      }
    } catch (error) {
      return Promise.reject(error)
    }

    return Promise.resolve(version)
  }

  /**
   * Closes the client and all its resources (connections, ...)
   */
  async close(): Promise<void> {
    await this._writeApi.close()
    await this._queryApi.close()
  }
}
