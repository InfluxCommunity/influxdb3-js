import {PointValues} from './PointValues'
import {QueryType} from './options'

export type QParamType = string | number | boolean

/**
 * Asynchronous API that queries data from a database.
 */
export default interface QueryApi {
  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryType - The type of query (default: 'sql').
   * @param queryParams - for sql queries parameters to be used
   * @returns An async generator that yields maps of string keys to any values.
   */
  query(
    query: string,
    database: string,
    queryType: QueryType,
    queryParams?: Map<string, QParamType>
  ): AsyncGenerator<Record<string, any>, void, void>

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryType - The type of query (default: 'sql').
   * @param queryParams - for sql queries parameters to be used
   * @returns An async generator that yields PointValues object.
   */
  queryPoints(
    query: string,
    database: string,
    queryType: QueryType,
    queryParams?: Map<string, QParamType>
  ): AsyncGenerator<PointValues, void, void>

  close(): Promise<void>
}
