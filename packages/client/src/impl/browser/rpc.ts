import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {CreateQueryTransport} from '../implSelector'
import {replaceURLProtocolWithPort} from '../../util/fixUrl'

export const createTransport: CreateQueryTransport = ({host}) => {
  const {url} = replaceURLProtocolWithPort(host)

  return new GrpcWebFetchTransport({baseUrl: url})
}
