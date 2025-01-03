import {RecordBatchReader, Type as ArrowType} from 'apache-arrow'
import QueryApi, {QParamType} from '../QueryApi'
import {Ticket} from '../generated/flight/Flight'
import {FlightServiceClient} from '../generated/flight/Flight.client'
import {ConnectionOptions, QueryOptions, QueryType} from '../options'
import {createInt32Uint8Array} from '../util/common'
import {RpcMetadata, RpcOptions} from '@protobuf-ts/runtime-rpc'
import {impl} from './implSelector'
import {PointFieldType, PointValues} from '../PointValues'
import {allParamsMatched, queryHasParams} from '../util/sql'
import {CLIENT_LIB_USER_AGENT} from './version'
import {getMappedValue} from '../util/TypeCasting'

export type TicketDataType = {
  database: string
  sql_query: string
  query_type: QueryType
  params?: {[name: string]: QParamType | undefined}
}

export default class QueryApiImpl implements QueryApi {
  private _closed = false
  private _flightClient: FlightServiceClient
  private _transport: ReturnType<typeof impl.queryTransport>

  private _defaultHeaders: Record<string, string> | undefined

  constructor(private _options: ConnectionOptions) {
    const {host, queryTimeout: timeout} = this._options
    this._defaultHeaders = this._options.headers
    this._transport = impl.queryTransport({host, timeout})
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

  private async *_queryRawBatches(
    query: string,
    database: string,
    options: QueryOptions
  ) {
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

    const flightDataStream = client.doGet(ticket, rpcOptions)

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

    yield* reader
  }

  async *query(
    query: string,
    database: string,
    options: QueryOptions
  ): AsyncGenerator<Record<string, any>, void, void> {
    const batches = this._queryRawBatches(query, database, options)

    for await (const batch of batches) {
      const row: Record<string, any> = {}
      for (const batchRow of batch) {
        for (const column of batch.schema.fields) {
          const value = batchRow[column.name]
          row[column.name] = getMappedValue(column, value)
        }
        yield row
      }
    }
  }

  async *queryPoints(
    query: string,
    database: string,
    options: QueryOptions
  ): AsyncGenerator<PointValues, void, void> {
    const batches = this._queryRawBatches(query, database, options)

    for await (const batch of batches) {
      for (let rowIndex = 0; rowIndex < batch.numRows; rowIndex++) {
        const values = new PointValues()
        for (let columnIndex = 0; columnIndex < batch.numCols; columnIndex++) {
          const columnSchema = batch.schema.fields[columnIndex]
          const name = columnSchema.name
          const value = batch.getChildAt(columnIndex)?.get(rowIndex)
          const arrowTypeId = columnSchema.typeId
          const metaType = columnSchema.metadata.get('iox::column::type')

          if (value === undefined || value === null) continue

          if (
            (name === 'measurement' || name == 'iox::measurement') &&
            typeof value === 'string'
          ) {
            values.setMeasurement(value)
            continue
          }

          if (!metaType) {
            if (name === 'time' && arrowTypeId === ArrowType.Timestamp) {
              values.setTimestamp(value)
            } else {
              values.setField(name, value)
            }

            continue
          }

          const [, , valueType, _fieldType] = metaType.split('::')

          if (valueType === 'field') {
            if (_fieldType && value !== undefined && value !== null) {
              const mappedValue = getMappedValue(columnSchema, value)
              values.setField(name, mappedValue, _fieldType as PointFieldType)
            }
          } else if (valueType === 'tag') {
            values.setTag(name, value)
          } else if (valueType === 'timestamp') {
            values.setTimestamp(value)
          }
        }

        yield values
      }
    }
  }

  async close(): Promise<void> {
    this._closed = true
    this._transport.close?.()
  }
}
