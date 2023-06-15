import WriteApi from './WriteApi'
import {Transport} from './transport'
import WriteApiImpl from './impl/WriteApiImpl'
// replaced by ./impl/browser/FetchTransport in browser builds
import TransportImpl from './impl/node/NodeHttpTransport'
import {ClientOptions, QueryType, WriteOptions} from './options'
import {IllegalArgumentError} from './errors'
import {Point} from './Point'
import {convertTime} from './util/time'
import {isDefined} from './util/common'
/**
 * InfluxDB's entry point that configures communication with InfluxDB 3 server and provide APIs to write and query data.
 */
import * as grpc from '@grpc/grpc-js'
import {FlightServiceClient} from './generated/Flight.grpc-client'
import {Ticket} from './generated/Flight'
import {RecordBatchReader} from 'apache-arrow'

const createInt32Uint8Array = (value: number) => {
  const bytes = new Uint8Array(4)
  bytes[0] = value >> (8 * 0)
  bytes[1] = value >> (8 * 1)
  bytes[2] = value >> (8 * 2)
  bytes[3] = value >> (8 * 3)
  return bytes
}

export default class InfluxDBClient {
  private readonly _options: ClientOptions
  private readonly _writeApi: WriteApi
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
    this._writeApi = new WriteApiImpl(this.transport)
  }

  private _mergeWriteOptions = (writeOptions?: Partial<WriteOptions>) => {
    return {
      ...this._options.writeOptions,
      ...writeOptions,
    }
  }

  async write(
    lines: string | ArrayLike<string>,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    await this._writeApi.doWrite(
      typeof lines === 'string' ? [lines] : Array.from(lines),
      database,
      org,
      this._mergeWriteOptions(writeOptions)
    )
  }

  async writePoint(
    point: Point,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    await this.writePoints([point], database, org, writeOptions)
  }

  async writePoints(
    points: ArrayLike<Point>,
    database: string,
    org?: string,
    writeOptions?: Partial<WriteOptions>
  ): Promise<void> {
    await this._writeApi.doWrite(
      Array.from(points)
        .map((p) => p.toLineProtocol())
        .filter(isDefined),
      database,
      org,
      this._mergeWriteOptions(writeOptions)
    )
  }

  async *query(
    query: string,
    database: string,
    queryType: QueryType = 'sql'
  ): AsyncGenerator<Map<string, any>, void, void> {
    const client = new FlightServiceClient(
      // TODO: options
      'us-east-1-1.aws.cloud2.influxdata.com:443',
      // grpc.credentials.createInsecure()
      grpc.credentials.createSsl()
    )

    const ticketData = {
      database: database,
      sql_query: query,
      query_type: queryType,
    }
    const ticket = Ticket.create({
      ticket: new TextEncoder().encode(JSON.stringify(ticketData)),
    })

    const metadata = new grpc.Metadata()
    const token = this._options.token
    if (token) metadata.set('authorization', 'Bearer ' + token)

    const flightDataStream = client.doGet(ticket, metadata)

    const binaryStream = (async function* () {
      for await (const flightData of flightDataStream) {
        // Include the length of dataHeader for the reader.
        yield createInt32Uint8Array(flightData.dataHeader.length)
        yield flightData.dataHeader
        // Length of dataBody is already included in dataHeader.
        yield flightData.dataBody
      }
    })()

    const reader = await RecordBatchReader.from(binaryStream)

    for await (const batch of reader) {
      for (let rowIndex = 0; rowIndex < batch.numRows; rowIndex++) {
        const row: Map<string, any> = new Map()
        for (let columnIndex = 0; columnIndex < batch.numCols; columnIndex++) {
          const name = batch.schema.fields[columnIndex].name
          const value = batch.getChildAt(columnIndex)?.get(rowIndex)
          row.set(name, value)
        }

        yield row
      }
    }

    flightDataStream.cancel()
  }

  get convertTime() {
    return (value: string | number | Date | undefined) =>
      convertTime(value, this._options.writeOptions?.precision)
  }

  async close(): Promise<void> {
    await this._writeApi.close()
  }
}
