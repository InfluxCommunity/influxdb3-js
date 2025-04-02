// this file together with tsup config helps selects correct implementations for node/browser
// Don't rename this file unless you change it's name inside tsup config

import {Transport} from '../transport'
import {ClientOptions, ConnectionOptions, QueryOptions} from '../options'

// This import path is replaced by tsup for browser. Don't change path for ./node or ./browser!
export {default as impl} from './node'


export interface QueryProvider {
  queryRawBatches(
      query: string,
      database: string,
      options: QueryOptions
  ): AsyncGenerator<any, void, void>
}

export type CreateWriteTransport = (options: ClientOptions) => Transport
export type CreateQueryProvider = (options: ConnectionOptions) => QueryProvider

export type TargetBasedImplementation = {
  writeTransport: CreateWriteTransport
  queryProvider: CreateQueryProvider
}
