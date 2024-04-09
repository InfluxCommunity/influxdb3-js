import {PointValues} from './PointValues'
import {QueryOptions} from './options'

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
   * @param options - options applied to the query (default: { type: 'sql'}).
   * @returns An async generator that yields maps of string keys to any values.
   */
  query(
    query: string,
    database: string,
    options: QueryOptions
  ): AsyncGenerator<Record<string, any>, void, void>

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param options - Options for the query (default: {type: 'sql'}).
   * @returns An async generator that yields PointValues object.
   */
  queryPoints(
    query: string,
    database: string,
    options: QueryOptions
  ): AsyncGenerator<PointValues, void, void>

  close(): Promise<void>
}
