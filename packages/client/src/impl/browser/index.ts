import {TargetBasedImplementation} from '../implSelector'
import FetchTransport from './FetchTransport'
import {createTransport} from './rpc'

const implementation: TargetBasedImplementation = {
  writeTransport: (opts) => new FetchTransport(opts),
  queryTransport: createTransport,
}

export default implementation
