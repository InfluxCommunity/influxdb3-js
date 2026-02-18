import {Headers} from './results'

function formatErrorMessage(node: any): string | undefined {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return undefined
  }
  const message = typeof node.message === 'string' ? node.message : undefined
  if (message) {
    return message
  }

  const errorText = typeof node.error === 'string' ? node.error : undefined
  const data = node.data
  if (errorText && Array.isArray(data)) {
    const details: string[] = []
    for (const item of data) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        continue
      }
      const lineNumber = item.line_number
      const errorMessage = item.error_message
      const originalLine = item.original_line
      if (
        lineNumber !== undefined &&
        lineNumber !== null &&
        typeof errorMessage === 'string' &&
        errorMessage.length > 0 &&
        typeof originalLine === 'string' &&
        originalLine.length > 0
      ) {
        details.push(`\tline ${lineNumber}: ${errorMessage} (${originalLine})`)
      } else if (typeof errorMessage === 'string' && errorMessage.length > 0) {
        details.push(`\t${errorMessage}`)
      }
    }
    if (details.length) {
      return `${errorText}:\n${details.join('\n')}`
    }
    return errorText
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const errorMessage = (data as {error_message?: unknown}).error_message
    if (typeof errorMessage === 'string' && errorMessage.length > 0) {
      return errorMessage
    }
  }
  if (errorText) {
    return errorText
  }

  return undefined
}

/** IllegalArgumentError is thrown when illegal argument is supplied. */
export class IllegalArgumentError extends Error {
  /* istanbul ignore next */
  constructor(message: string) {
    super(message)
    this.name = 'IllegalArgumentError'
    Object.setPrototypeOf(this, IllegalArgumentError.prototype)
  }
}

/**
 * A general HTTP error.
 */
export class HttpError extends Error {
  /** application error code, when available */
  public code: string | undefined
  /** json error response */
  public json: any

  /* istanbul ignore next because of super() not being covered*/
  constructor(
    readonly statusCode: number,
    readonly statusMessage: string | undefined,
    readonly body?: string,
    readonly contentType?: string | undefined | null,
    readonly headers?: Headers | null,
    message?: string
  ) {
    super()
    Object.setPrototypeOf(this, HttpError.prototype)
    if (message) {
      this.message = message
    } else if (body) {
      // Core/Enterprise may not set Content-Type header
      if (contentType?.startsWith('application/json') || !contentType) {
        try {
          this.json = JSON.parse(body)
          if (typeof this.json?.code === 'string') {
            this.code = this.json.code
          }
          const parsedMessage = formatErrorMessage(this.json)
          if (parsedMessage) {
            this.message = parsedMessage
          }
        } catch (e) {
          // silently ignore, body string is still available
        }
      }
    }
    if (!this.message) {
      this.message = `${statusCode} ${statusMessage} : ${body}`
    }
    this.name = 'HttpError'
  }
}

/** RequestTimedOutError indicates request timeout in the communication with the server */
export class RequestTimedOutError extends Error {
  /* istanbul ignore next because of super() not being covered */
  constructor() {
    super()
    Object.setPrototypeOf(this, RequestTimedOutError.prototype)
    this.name = 'RequestTimedOutError'
    this.message = 'Request timed out'
  }
}

/** AbortError indicates that the communication with the server was aborted */
export class AbortError extends Error {
  /* istanbul ignore next because of super() not being covered */
  constructor() {
    super()
    this.name = 'AbortError'
    Object.setPrototypeOf(this, AbortError.prototype)
    this.message = 'Response aborted'
  }
}
