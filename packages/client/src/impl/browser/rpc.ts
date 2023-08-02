import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {CreateQueryTransport} from '../implSelector'

export const createTransport: CreateQueryTransport = ({host}) => {
  return new GrpcWebFetchTransport({baseUrl: host})
}
