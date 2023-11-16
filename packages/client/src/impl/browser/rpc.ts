import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {CreateQueryTransport} from '../implSelector'

export const createTransport: CreateQueryTransport = ({host, timeout}) => {
  return new GrpcWebFetchTransport({baseUrl: host, timeout})
}
