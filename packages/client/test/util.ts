import {assert, expect} from 'chai'
import {setLogger} from '../src/util/logger'
import {Cancellable, ConnectionOptions, SendOptions} from '../src'
import NodeHttpTransport from '../src/impl/node/NodeHttpTransport'

let previous: any

export interface CollectedLogs {
  error: Array<Array<any>>
  warn: Array<Array<any>>
  reset(): void
}

const createCollectedLogs = (): CollectedLogs => {
  const collectedLogs: CollectedLogs = {
    error: [],
    warn: [],
    reset() {
      collectedLogs.error.splice(0)
      collectedLogs.warn.splice(0)
    },
  }
  return collectedLogs
}

export const collectLogging = {
  replace(): CollectedLogs {
    const collectedLogs = createCollectedLogs()
    previous = setLogger({
      error: function (...args) {
        collectedLogs.error.push(args)
      },
      warn: function (...args) {
        collectedLogs.warn.push(args)
      },
    })
    return collectedLogs
  },
  after(): void {
    if (previous) {
      setLogger(previous)
      previous = undefined
    }
  },
}

let rejections: Array<any> = []
function addRejection(e: any) {
  rejections.push(e)
}

/**
 * Used by unit tests to check that no unhandled promise rejection occurs.
 */
export const unhandledRejections = {
  before(): void {
    rejections = []
    process.on('unhandledRejection', addRejection)
  },
  after(): void {
    process.off('unhandledRejection', addRejection)
    expect(rejections, 'Unhandled Promise rejections detected').deep.equals([])
  },
}

export const expectThrowsAsync = async (
  method: () => void,
  expectedMessage?: string | RegExp,
  errName?: string
): Promise<void> => {
  let err: any = null
  try {
    await method()
  } catch (rejected) {
    err = rejected
  }
  if (!err) {
    assert.fail(
      `Method ${method} should throw error ${errName ?? 'Error'}: ${
        expectedMessage ?? ''
      }`
    )
  }
  if (errName) {
    expect(err.name).to.equal(errName)
  }
  if (expectedMessage) {
    if (typeof expectedMessage === 'string') {
      expect(err['message']).to.be.equal(expectedMessage)
    }
    if (expectedMessage instanceof RegExp) {
      expect(err['message']).to.match(expectedMessage)
    }
  }
}

export const expectResolve = async (method: () => void): Promise<void> => {
  try {
    await method()
  } catch (error) {
    assert.fail(
      `Method should resolve without error: ${method}.  But caught ${error}`
    )
  }
}

export const sendTestData = (
  connectionOptions: ConnectionOptions,
  sendOptions: SendOptions,
  setCancellable?: (cancellable: Cancellable) => void
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeouted')), 10000)
    let data = ''
    new NodeHttpTransport(connectionOptions).send('/test', '', sendOptions, {
      next(chunk: any) {
        console.log(chunk)
        data += chunk.toString()
      },
      error(error: any) {
        clearTimeout(timeout)
        reject(error)
      },
      complete(): void {
        clearTimeout(timeout)
        resolve(data)
      },
      useCancellable(cancellable: Cancellable) {
        if (setCancellable) setCancellable(cancellable)
      },
    })
  })
}

export const iterateTestData = async (
  connectionOptions: ConnectionOptions,
  sendOptions: SendOptions
): Promise<string> => {
  let data = ''
  for await (const chunk of new NodeHttpTransport(connectionOptions).iterate(
    '/test',
    '',
    sendOptions
  )) {
    data += chunk.toString()
  }
  return data
}
