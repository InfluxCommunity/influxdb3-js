import {RecordBatchReader} from 'apache-arrow'
import {QParamType} from '../../QueryApi'
import {Ticket} from '../../generated/flight/Flight'
import {FlightServiceClient} from '../../generated/flight/Flight.client'
import {ConnectionOptions, QueryOptions, QueryType} from '../../options'
import {createInt32Uint8Array} from '../../util/common'
import {RpcMetadata, RpcOptions} from '@protobuf-ts/runtime-rpc'
import {QueryProvider} from '../implSelector'
import {allParamsMatched, queryHasParams} from '../../util/sql'
import {CLIENT_LIB_USER_AGENT} from '../version'
import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'

export type TicketDataType = {
  database: string
  sql_query: string
  query_type: QueryType
  params?: {[name: string]: QParamType | undefined}
}

export default class BrowserQueryProvider implements QueryProvider {
  private _closed = false
  private _flightClient: FlightServiceClient
  private _transport: GrpcWebFetchTransport

  private _defaultHeaders: Record<string, string> | undefined

  constructor(private _options: ConnectionOptions) {
    const {host, queryTimeout: timeout} = this._options
    this._defaultHeaders = this._options.headers
    this._transport = new GrpcWebFetchTransport({baseUrl: host, timeout})
    this._flightClient = new FlightServiceClient(this._transport)
  }

  prepareTicket(
    database: string,
    query: string,
    options: QueryOptions
  ): Ticket {
    const ticketData: TicketDataType = {
      database: database,
      sql_query: query,
      query_type: options.type,
    }

    if (options.params) {
      const param: {[name: string]: QParamType | undefined} = {}
      for (const key of Object.keys(options.params)) {
        if (options.params[key]) {
          param[key] = options.params[key]
        }
      }
      ticketData['params'] = param as {[name: string]: QParamType | undefined}
    }

    return Ticket.create({
      ticket: new TextEncoder().encode(JSON.stringify(ticketData)),
    })
  }

  prepareMetadata(headers?: Record<string, string>): RpcMetadata {
    const meta: RpcMetadata = {
      'User-Agent': CLIENT_LIB_USER_AGENT,
      ...this._defaultHeaders,
      ...headers,
    }

    const token = this._options.token
    if (token) meta['authorization'] = `Bearer ${token}`

    return meta
  }

  async *queryRawBatches(
    query: string,
    database: string,
    options: QueryOptions
  ): AsyncGenerator<Record<string, any>, void, void> {
    if (options.params && queryHasParams(query)) {
      allParamsMatched(query, options.params)
    }

    if (this._closed) {
      throw new Error('queryApi: already closed!')
    }
    const client = this._flightClient

    const ticket = this.prepareTicket(database, query, options) // queryType, queryParams)

    const meta = this.prepareMetadata(options.headers)
    const rpcOptions: RpcOptions = {meta}
    const getStart = Date.now()
    const flightDataStream = client.doGet(ticket, rpcOptions)
    const getEnd = Date.now()
    console.log(`get time: ${getEnd - getStart}ms`)
    const start = Date.now()
    const binaryStream = (async function* () {
      for await (const flightData of flightDataStream.responses) {
        // Include the length of dataHeader for the reader.
        yield createInt32Uint8Array(flightData.dataHeader.length)
        yield flightData.dataHeader
        // Length of dataBody is already included in dataHeader.
        yield flightData.dataBody
      }
    })()

    const reader = await RecordBatchReader.from(binaryStream)
    const end = Date.now()
    console.log(`record batch reader time: ${end - start}ms`)
    yield* reader
  }

  async close(): Promise<void> {
    this._closed = true
  }
}
