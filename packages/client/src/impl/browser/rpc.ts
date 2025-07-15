import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {CreateQueryTransport} from '../implSelector'

export const createTransport: CreateQueryTransport = ({
  host,
  timeout,
  clientOptions
}) => {

  if (clientOptions) {
    console.warn(`Detected grpcClientOptions: such options are ignored in the GrpcWebFetchTransport:\n
    ${JSON.stringify(clientOptions)}`)
  }
  return new GrpcWebFetchTransport({baseUrl: host, timeout})
}
