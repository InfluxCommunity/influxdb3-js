import WriteApi from './WriteApi'
import {Transport} from './transport'
import WriteApiImpl from './impl/WriteApiImpl'
// replaced by ./impl/browser/FetchTransport in browser builds
import TransportImpl from './impl/node/NodeHttpTransport'
import {ClientOptions, WriteOptions} from './options'
import {IllegalArgumentError} from './errors'
import {Point} from './Point'
import {convertTime} from './util/time'
import {isDefined} from './util/common'
/**
 * InfluxDB's entry point that configures communication with InfluxDB 3 server and provide APIs to write and query data.
 */
import * as grpc from '@grpc/grpc-js'
import {FlightData, Ticket} from './Flight.pb'
import {Observable} from 'rxjs'

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>
  clientStreamingRequest(
    service: string,
    method: string,
    data: Observable<Uint8Array>
  ): Promise<Uint8Array>
  serverStreamingRequest(
    service: string,
    method: string,
    data: Uint8Array
  ): Observable<Uint8Array>
  bidirectionalStreamingRequest(
    service: string,
    method: string,
    data: Observable<Uint8Array>
  ): Observable<Uint8Array>
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

  async *query() {
    // query: string, database: string, queryType: QueryType = 'sql'

    const conn = new grpc.Client(
      'us-east-1-1.aws.cloud2.influxdata.com:443',
      grpc.credentials.createInsecure()
    )

    type RpcImpl = (
      service: string,
      method: string,
      data: Uint8Array
    ) => Promise<Uint8Array>

    const sendRequest: RpcImpl = (service, method, data) => {
      // Conventionally in gRPC, the request path looks like
      //   "package.names.ServiceName/MethodName",
      // we therefore construct such a string
      const path = `/${service}/${method}`

      return new Promise((resolve, reject) => {
        // makeUnaryRequest transmits the result (and error) with a callback
        // transform this into a promise!
        const resultCallback: any = (err: any, res: any) => {
          if (err) {
            return reject(err)
          }
          resolve(res)
        }

        function passThrough(argument: any) {
          return argument
        }

        // Using passThrough as the serialize and deserialize functions
        conn.makeUnaryRequest(
          path,
          passThrough,
          passThrough,
          data,
          resultCallback
        )
      })
    }
    const rpc: Rpc = {
      request: sendRequest,
      bidirectionalStreamingRequest(_service, _method, _data) {
        throw new Error('not implemented!')
      },
      clientStreamingRequest(_service, _method, _data) {
        throw new Error('not implemented!')
      },
      serverStreamingRequest(_service, _method, _data): Observable<Uint8Array> {
        throw new Error('not implemented!')
      },
    }

    // const client = new FlightServiceClientImpl(rpc)

    const query = `
  SELECT *
		FROM "stat"
		WHERE
		time >= now() - interval '10 minute'
`

    const ticketData = {
      database: 'CI_TEST',
      sql_query: query,
      query_type: 'sql',
    }

    const ticket = Ticket.create({
      ticket: Uint8Array.from(JSON.stringify(ticketData), (x) =>
        x.charCodeAt(0)
      ),
    })
    // const ticket = Ticket.fromJSON({ticket: ticketData})

    // ticket.ticket = JSON.stringify(ticketData).to;

    const ticketEncoded = Ticket.encode(ticket).finish()

    // client.DoGet(ticket).subscribe((v) => {
    //   debugger
    //   console.log(v)
    // })

    const result = await rpc.request(
      'arrow.flight.protocol.FlightService',
      'DoGet',
      ticketEncoded
    )
    const dataResult = FlightData.decode(result)
    console.log(dataResult)

    yield 0
  }

  get convertTime() {
    return (value: string | number | Date | undefined) =>
      convertTime(value, this._options.writeOptions?.precision)
  }

  async close(): Promise<void> {
    await this._writeApi.close()
  }
}
