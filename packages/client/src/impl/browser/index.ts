import {TargetBasedImplementation} from '../implSelector'
import FetchTransport from './FetchTransport'
import BrowserQueryProvider from './query'
import {ConnectionOptions} from '../../options'

const implementation: TargetBasedImplementation = {
  writeTransport: (opts) => new FetchTransport(opts),
  queryProvider: (options: ConnectionOptions) =>
    new BrowserQueryProvider(options),
}

export default implementation
