import {RecordBatchReader} from 'apache-arrow'
import {ConnectionOptions, QueryOptions} from '../../options'
import {allParamsMatched, queryHasParams} from '../../util/sql'
import {ClientOptions, createFlightSqlClient, FlightSqlClient, KeyValue} from '../../../native';
import {QueryProvider} from "../implSelector";


export default class NodeQueryProvider implements QueryProvider {
  private _closed = false
  private _flightClient: FlightSqlClient
  private _clientOptions: ClientOptions
  //private _defaultHeaders: Record<string, string> | undefined

  constructor(private _options: ConnectionOptions)  {
    const {host, token, database} = this._options
    //this._defaultHeaders = this._options.headers
    //const clopts : ClientOptions = {
    this._clientOptions = {
      host: host,
      token: token,
      headers: [{key: "database", value: database}] as KeyValue[],
    };
    //this._clientOptions = clopts;

  }

  async *queryRawBatches(
    query: string,
    database: string,
    options: QueryOptions
  ) {
    if(this._flightClient === undefined) {
      this._flightClient = await createFlightSqlClient(this._clientOptions)
    }
    if (options.params && queryHasParams(query)) {
      allParamsMatched(query, options.params)
    }

    if (this._closed) {
      throw new Error('queryApi: already closed!')
    }
    const client = this._flightClient

    const binaryStream = await client.query(query)

    const reader = await RecordBatchReader.from(binaryStream)
    //console.log(`record batch reader time: ${end - start}ms`);
    yield* reader
  }

}
