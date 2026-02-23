import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {CreateQueryTransport} from '../implSelector'

export const createQueryTransport: CreateQueryTransport = ({
  host,
  timeout,
  clientOptions,
}) => {
  const {interceptors} = clientOptions ?? {}

  return new GrpcWebFetchTransport({
    baseUrl: host,
    timeout,
    interceptors: interceptors,
  })
}
