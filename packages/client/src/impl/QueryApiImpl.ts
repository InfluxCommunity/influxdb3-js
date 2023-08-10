import {RecordBatchReader} from 'apache-arrow'
import QueryApi from '../QueryApi'
import {Ticket} from '../generated/flight/Flight'
import {FlightServiceClient} from '../generated/flight/Flight.client'
import {ConnectionOptions, QueryType} from '../options'
import {createInt32Uint8Array} from '../util/common'
import {RpcMetadata, RpcOptions} from '@protobuf-ts/runtime-rpc'
import {impl} from './implSelector'

export default class QueryApiImpl implements QueryApi {
  private _closed = false
  private _flightClient: FlightServiceClient
  private _transport: ReturnType<typeof impl.queryTransport>

  constructor(private _options: ConnectionOptions) {
    this._transport = impl.queryTransport(this._options)
    this._flightClient = new FlightServiceClient(this._transport)
  }

  async *query(
    query: string,
    database: string,
    queryType: QueryType
  ): AsyncGenerator<Record<string, any>, void, void> {
    if (this._closed) {
      throw new Error('queryApi: already closed!')
    }
    const client = this._flightClient

    const ticketData = {
      database: database,
      sql_query: query,
      query_type: queryType,
    }
    const ticket = Ticket.create({
      ticket: new TextEncoder().encode(JSON.stringify(ticketData)),
    })

    const meta: RpcMetadata = {}

    const token = this._options.token
    if (token) meta['authorization'] = `Bearer ${token}`

    const options: RpcOptions = {meta}

    const flightDataStream = client.doGet(ticket, options)

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

    for await (const batch of reader) {
      for (let rowIndex = 0; rowIndex < batch.numRows; rowIndex++) {
        const row: Record<string, any> = {}
        for (let columnIndex = 0; columnIndex < batch.numCols; columnIndex++) {
          const name = batch.schema.fields[columnIndex].name
          const value = batch.getChildAt(columnIndex)?.get(rowIndex)
          row[name] = value
        }

        yield row
      }
    }
  }

  async close(): Promise<void> {
    this._closed = true
    this._transport.close?.()
  }
}
