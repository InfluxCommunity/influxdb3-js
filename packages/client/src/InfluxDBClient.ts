import WriteApi from './WriteApi'
import {Transport} from './transport'
import WriteApiImpl from './impl/WriteApiImpl'
// replaced by ./impl/browser/FetchTransport in browser builds
import TransportImpl from './impl/node/NodeHttpTransport'
import {ClientOptions, QueryType, WriteOptions} from './options'
import {IllegalArgumentError} from './errors'
import {NotArrayLike, NotPointRecord, Point, PointRecord} from './Point'
import {convertTime} from './util/time'
import {isArrayLike, isDefined} from './util/common'
import QueryApi from './QueryApi'
import QueryApiImpl from './impl/QueryApiImpl'

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
    data: // The 'ArrayLike' and 'PointRecord' types must be marked with 'Not' types to avoid type confusion
    | NotPointRecord<
          ArrayLike<string> | ArrayLike<Point> | ArrayLike<PointRecord>
        >
      | NotArrayLike<PointRecord>
      | string
      | Point,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    const arrayData: ArrayLike<any> = (
      isArrayLike(data) && typeof data !== 'string' ? data : [data]
    ) as any[]
    if (arrayData.length === 0) return
    if (typeof arrayData[0] === 'string') {
      await this.writeLines(arrayData as any, database, org, writeOptions)
    } else if (arrayData[0] instanceof Point) {
      await this.writePoints(arrayData as any, database, org, writeOptions)
    } else {
      await this.writeRecords(arrayData as any, database, org, writeOptions)
    }
  }

  async writeLines(
    lines: string | ArrayLike<string>,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ) {
    await this._writeApi.doWrite(
      typeof lines === 'string' ? [lines] : Array.from(lines),
      database,
      org,
      this._mergeWriteOptions(writeOptions)
    )
  }

  private async writePoints(
    points: ArrayLike<Point> | Point,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    const pointsArr = points instanceof Point ? [points] : Array.from(points)

    await this._writeApi.doWrite(
      pointsArr.map((p) => p.toLineProtocol()).filter(isDefined),
      database,
      org,
      this._mergeWriteOptions(writeOptions)
    )
  }

  private async writeRecords(
    records: ArrayLike<PointRecord>,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    await this.writePoints(
      Array.from(records).map((record) => Point.fromRecord(record)),
      database,
      org,
      writeOptions
    )
  }

  query(
    database: string,
    query: string,
    queryType: QueryType = 'sql'
  ): AsyncGenerator<Record<string, any>, void, void> {
    return this._queryApi.query(database, query, queryType)
  }

  get convertTime() {
    return (value: string | number | Date | undefined) =>
      convertTime(value, this._options.writeOptions?.precision)
  }

  async close(): Promise<void> {
    await this._writeApi.close()
    await this._queryApi.close()
  }
}
