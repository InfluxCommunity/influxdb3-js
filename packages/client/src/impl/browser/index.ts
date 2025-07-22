import {TargetBasedImplementation} from '../implSelector'
import FetchTransport from './FetchTransport'
import {createQueryTransport} from './rpc'

const implementation: TargetBasedImplementation = {
  writeTransport: (opts) => new FetchTransport(opts),
  queryTransport: createQueryTransport,
}

export default implementation
