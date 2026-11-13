import {GrpcTransport} from '@protobuf-ts/grpc-transport'
import {replaceURLProtocolWithPort} from '../../util/fixUrl'
import {CreateQueryTransport} from '../implSelector'
import * as grpc from '@grpc/grpc-js'
import fs from 'fs'

const createChannelCredentials = (
  serverCertPath?: string,
  clientCertPath?: string,
  clientKeyPath?: string
): grpc.ChannelCredentials => {
  const serverCertByte = serverCertPath ? fs.readFileSync(serverCertPath) : null
  const clientCertByte = clientCertPath ? fs.readFileSync(clientCertPath) : null
  const clientKeyByte = clientKeyPath ? fs.readFileSync(clientKeyPath) : null

  return grpc.credentials.createSsl(
    serverCertByte,
    clientKeyByte,
    clientCertByte
  )
}

export const createTransport: CreateQueryTransport = ({
  host,
  timeout,
  clientOptions,
}) => {
  const {url, safe} = replaceURLProtocolWithPort(host)
  let channelCredentials = grpc.ChannelCredentials.createInsecure()
  if (
    safe &&
    clientOptions &&
    (clientOptions.serverCertPath || clientOptions.clientCertPath)
  ) {
    channelCredentials = createChannelCredentials(
      clientOptions.serverCertPath,
      clientOptions.clientCertPath,
      clientOptions.clientKeyPath
    )
  }

  const {interceptors, ...otherClientOptions} = clientOptions ?? {}

  return new GrpcTransport({
    host: url,
    channelCredentials: channelCredentials,
    clientOptions: otherClientOptions,
    interceptors: interceptors,
    timeout: timeout,
  })
}
