import {TargetBasedImplementation} from '../implSelector'
import NodeHttpTransport from './NodeHttpTransport'
import {createTransport} from './rpc'

const implementation: TargetBasedImplementation = {
  writeTransport: (opts) => new NodeHttpTransport(opts),
  queryTransport: createTransport,
}

export default implementation
