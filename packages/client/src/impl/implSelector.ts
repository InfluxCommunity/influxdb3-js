// this file together with tsup config helps selects correct implementations for node/browser
// Don't rename this file unless you change it's name inside tsup config

import {RpcTransport} from '@protobuf-ts/runtime-rpc'
import {Transport} from '../transport'
import {ClientOptions} from '../options'

// This import path is replaced by tsup for browser. Don't change path for ./node or ./browser!
export {default as impl} from './node'

interface MaybeCloseable {
  close?(): void
}

export type CreateWriteTransport = (options: ClientOptions) => Transport
export type CreateQueryTransport = (options: {
  host: string
}) => RpcTransport & MaybeCloseable

export type TargetBasedImplementation = {
  writeTransport: CreateWriteTransport
  queryTransport: CreateQueryTransport
}
