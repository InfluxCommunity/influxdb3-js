import {Headers} from './results'

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
      if (contentType?.startsWith('application/json') || !contentType) { // Edge may not set Content-Type header
        try {
          this.json = JSON.parse(body)
          this.message = this.json.message
          this.code = this.json.code
          if (!this.message) {
            interface EdgeBody {
              error?: string;
              data?: {
                error_message: string;
              }
            }
            const eb: EdgeBody = this.json as EdgeBody
            if (eb.data?.error_message) {
              this.message = eb.data.error_message
            } else if (eb.error) {
              this.message = eb.error
            }
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
