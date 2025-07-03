import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {CreateQueryTransport} from '../implSelector'

export const createTransport: CreateQueryTransport = ({host, timeout, grpcClientOptions}) => {

  if (grpcClientOptions) {
    // TODO use logger
    console.warn(`Detected grpcClientOptions: such options are ignored in the GrpcWebFetchTransport:\n
    ${JSON.stringify(grpcClientOptions)}`)
  }
  return new GrpcWebFetchTransport({baseUrl: host, timeout})
}
