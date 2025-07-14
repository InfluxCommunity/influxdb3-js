import {assert, expect} from 'chai'
import {setLogger} from '../src/util/logger'

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
