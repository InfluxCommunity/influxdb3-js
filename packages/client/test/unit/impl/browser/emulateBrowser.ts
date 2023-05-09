import {HttpError} from '../../../../src'

interface ResponseSpec {
  headers?: {[key: string]: string}
  status?: number
  body?: string | Uint8Array | Array<Uint8Array>
}

function createResponse({
  headers = {},
  status = 200,
  body = '',
}: ResponseSpec): any {
  const retVal: any = {
    status,
    statusText: `X${status}X`,
    headers: {
      get(key: string): string | undefined {
        return headers[key] ?? headers[key.toLowerCase()]
      },
      forEach(fn: (value: string, key: string) => void): void {
        Object.keys(headers).forEach((key: string) => {
          fn(headers[key], key)
          if (key === 'duplicate') {
            fn(headers[key] + '2', key)
            fn(headers[key] + '3', key)
          }
        })
      },
    },
    json(): Promise<any> {
      if (typeof body === 'string') {
        if (body === 'error') return Promise.reject(new Error('error data'))
        return Promise.resolve(body).then((body) =>
          body ? JSON.parse(body) : ''
        )
      } else {
        return Promise.reject(new Error('String body expected, but ' + body))
      }
    },
  }
  if (typeof body === 'string') {
    retVal.text = function (): Promise<string> {
      if (body === 'error') return Promise.reject(new Error('error data'))
      return Promise.resolve(body)
    }
  }
  if (body instanceof Uint8Array) {
    retVal.arrayBuffer = function (): Promise<any> {
      return Promise.resolve(
        body.buffer.slice(body.byteOffset, body.byteOffset + body.length)
      )
    }
  }
  if (Array.isArray(body)) {
    retVal.body = {
      cancel() {},
      getReader(): any {
        let position = 0
        return {
          read(): Promise<any> {
            if (position < body.length) {
              return Promise.resolve({
                value: body[position++],
                done: false,
              })
            } else {
              return Promise.resolve({
                value: undefined,
                done: true,
              })
            }
          },
          cancel(_msg = '') {
            /* read cancelled with an optional message*/
          },
        }
      },
    }
  }
  return retVal
}

let beforeEmulation:
  | {fetch: any; abortController: any; textEncoder: any}
  | undefined

export class AbortController {
  private listeners: Array<() => void> = []
  signal = {
    aborted: false,
    addEventListener: (type: string, listener: () => void) => {
      this.listeners.push(listener)
    },
  }
  constructor(aborted = false) {
    this.signal.aborted = aborted
  }
  abort(): void {
    this.signal.aborted = true
    this.listeners.forEach((x) => x())
  }

  getSignal(): AbortSignal {
    return this.signal as unknown as AbortSignal
  }
}

export function emulateFetchApi(
  spec: ResponseSpec,
  onRequest?: (options: any) => void
): void {
  function fetch(url: string, options: any): Promise<any> {
    if (onRequest) onRequest(options)
    return url.endsWith('error')
      ? Promise.reject(
          new HttpError(500, undefined, undefined, undefined, undefined, url)
        )
      : Promise.resolve(createResponse(spec))
  }
  class TextEncoder {
    encode(s: string): Uint8Array {
      return Buffer.from(s)
    }
  }
  const globalVars = global as any
  if (!beforeEmulation) {
    beforeEmulation = {
      fetch: globalVars.fetch,
      abortController: globalVars.AbortController,
      textEncoder: globalVars.TextEncoder,
    }
  }
  globalVars.fetch = fetch
  globalVars.AbortController = AbortController
  globalVars.TextEncoder = TextEncoder
}
export function removeFetchApi(): void {
  if (beforeEmulation) {
    const {fetch, abortController, textEncoder} = beforeEmulation
    beforeEmulation = undefined
    const globalVars = global as any
    globalVars.fetch = fetch
    globalVars.abortController = abortController
    globalVars.textEncoder = textEncoder
  }
}
