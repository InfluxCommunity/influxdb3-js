import {TargetBasedImplementation} from '../implSelector'
import NodeHttpTransport from './NodeHttpTransport'
import NodeQueryProvider from './query'

const implementation: TargetBasedImplementation = {
  writeTransport: (opts) => new NodeHttpTransport(opts),
  queryProvider: (options) => new NodeQueryProvider(options),
}

export default implementation
