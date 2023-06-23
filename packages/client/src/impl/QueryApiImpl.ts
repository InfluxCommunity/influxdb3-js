import {RecordBatchReader} from 'apache-arrow'
import QueryApi from '../QueryApi'
import {Ticket} from '../generated/flight/Flight'
import {FlightServiceClient} from '../generated/flight/Flight.grpc-client'
import {ConnectionOptions, QueryType} from '../options'
import {replaceURLProtocolWithPort} from '../util/fixUrl'
import * as grpc from '@grpc/grpc-js'
import {createInt32Uint8Array} from '../util/common'

export default class QueryApiImpl implements QueryApi {
  private closed = false
  private flightClient: FlightServiceClient

  constructor(private _options: ConnectionOptions) {
    const {url, safe} = replaceURLProtocolWithPort(this._options.url)
    const credentials =
      grpc.credentials[safe ?? true ? 'createSsl' : 'createInsecure']()
    this.flightClient = new FlightServiceClient(url, credentials)
  }

  async *query(
    query: string,
    database: string,
    queryType: QueryType = 'sql'
  ): AsyncGenerator<Record<string, any>, void, void> {
    if (this.closed) {
      throw new Error('queryApi: already closed!')
    }
    const client = this.flightClient

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
        const row: Record<string, any> = Object.create(null)
        for (let columnIndex = 0; columnIndex < batch.numCols; columnIndex++) {
          const name = batch.schema.fields[columnIndex].name
          const value = batch.getChildAt(columnIndex)?.get(rowIndex)
          row[name] = value
        }

        yield row
      }
    }

    flightDataStream.cancel()
  }

  async close(): Promise<void> {
    this.closed = true
    this.flightClient.close()
  }
}
