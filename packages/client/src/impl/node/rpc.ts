import {GrpcTransport} from '@protobuf-ts/grpc-transport'
import {replaceURLProtocolWithPort} from '../../util/fixUrl'
import {CreateQueryTransport} from '../implSelector'
import * as grpc from '@grpc/grpc-js'

export const createTransport: CreateQueryTransport = ({host, timeout}) => {
  const {url, safe} = replaceURLProtocolWithPort(host)
  const channelCredentials =
    grpc.credentials[safe ?? true ? 'createSsl' : 'createInsecure']()

  return new GrpcTransport({host: url, channelCredentials, timeout})
}
