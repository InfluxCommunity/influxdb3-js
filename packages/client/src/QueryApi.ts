import {Point} from './Point'
import {QueryType} from './options'

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
   * @returns An async generator that yields maps of string keys to any values.
   */
  query(
    query: string,
    database: string,
    queryType: QueryType
  ): AsyncGenerator<Record<string, any>, void, void>

  /**
   * Execute a query and return the results as an async generator.
   *
   * @param query - The query string.
   * @param database - The name of the database to query.
   * @param queryType - The type of query (default: 'sql').
   * @returns An async generator that yields Point object.
   */
  queryPoints(
    query: string,
    database: string,
    queryType: QueryType
  ): AsyncGenerator<Point, void, void>

  close(): Promise<void>
}
