import {Headers} from './results'

export interface PartialWriteLineError {
  lineNumber: number
  errorMessage: string
  originalLine: string
}

function isV3PartialWriteErrorMessage(errorMessage: unknown): boolean {
  if (typeof errorMessage !== 'string' || errorMessage.length === 0) {
    return false
  }
  const normalized = errorMessage.toLowerCase()
  return (
    normalized.includes('partial write of line protocol occurred') ||
    normalized.includes('parsing failed for write_lp endpoint')
  )
}

function parseLineNumber(value: unknown): number {
  if (value === undefined || value === null) {
    return 0
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  throw new Error('line_number must be number')
}

function parseOriginalLine(value: unknown): string {
  if (value === undefined || value === null) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  throw new Error('original_line must be string')
}

function parsePartialWriteDataItem(
  item: unknown
): PartialWriteLineError | null {
  if (item === undefined || item === null) {
    return null
  }
  if (typeof item !== 'object' || Array.isArray(item)) {
    throw new Error('item is not an object')
  }
  const errorMessage = (item as {error_message?: unknown}).error_message
  if (typeof errorMessage !== 'string') {
    throw new Error('error_message must be string')
  }
  if (errorMessage.length === 0) {
    return null
  }
  const lineNumber = parseLineNumber(
    (item as {line_number?: unknown}).line_number
  )
  const originalLine = parseOriginalLine(
    (item as {original_line?: unknown}).original_line
  )
  return {lineNumber, errorMessage, originalLine}
}

function parseTypedLineErrors(
  data: unknown
): PartialWriteLineError[] | undefined {
  if (!Array.isArray(data)) {
    return undefined
  }
  const lineErrors: PartialWriteLineError[] = []
  try {
    for (const item of data) {
      const lineError = parsePartialWriteDataItem(item)
      if (lineError) {
        lineErrors.push(lineError)
      }
    }
  } catch {
    return undefined
  }
  return lineErrors.length > 0 ? lineErrors : undefined
}

function parseSingleLineError(
  data: unknown
): PartialWriteLineError | undefined {
  try {
    return parsePartialWriteDataItem(data) ?? undefined
  } catch {
    return undefined
  }
}

function formatTypedLineErrorDetails(
  lineErrors: PartialWriteLineError[]
): string[] {
  const details: string[] = []
  for (const lineError of lineErrors) {
    if (lineError.lineNumber !== 0) {
      if (lineError.originalLine.length > 0) {
        details.push(
          `\tline ${lineError.lineNumber}: ${lineError.errorMessage} (${lineError.originalLine})`
        )
      } else {
        details.push(
          `\tline ${lineError.lineNumber}: ${lineError.errorMessage}`
        )
      }
    } else {
      details.push(`\t${lineError.errorMessage}`)
    }
  }
  return details
}

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
  if (errorText && isV3PartialWriteErrorMessage(errorText)) {
    const typedArray = parseTypedLineErrors(data)
    if (typedArray) {
      const details = formatTypedLineErrorDetails(typedArray)
      return `${errorText}:\n${details.join('\n')}`
    }
    if (Array.isArray(data)) {
      const details: string[] = []
      for (const item of data) {
        if (item == null) {
          continue
        }
        const raw = JSON.stringify(item)
        if (raw && raw.toLowerCase() !== 'null') {
          details.push(`\t${raw}`)
        }
      }
      if (details.length) {
        return `${errorText}:\n${details.join('\n')}`
      }
      return errorText
    }
    const single = parseSingleLineError(data)
    if (single) {
      return `${errorText}:\n${formatTypedLineErrorDetails([single]).join('\n')}`
    }
    return errorText
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

export class PartialWriteError extends HttpError {
  constructor(
    statusCode: number,
    statusMessage: string | undefined,
    body: string | undefined,
    contentType: string | undefined | null,
    headers: Headers | null | undefined,
    message: string,
    readonly lineErrors: PartialWriteLineError[]
  ) {
    super(statusCode, statusMessage, body, contentType, headers)
    this.message = message
    this.name = 'PartialWriteError'
    Object.setPrototypeOf(this, PartialWriteError.prototype)
  }

  static fromHttpError(error: HttpError): PartialWriteError | undefined {
    const bodyJson = error.json
    if (!bodyJson || typeof bodyJson !== 'object' || Array.isArray(bodyJson)) {
      return undefined
    }
    const errorMessage = (bodyJson as {error?: unknown}).error
    if (!isV3PartialWriteErrorMessage(errorMessage)) {
      return undefined
    }
    const data = (bodyJson as {data?: unknown}).data
    const typedArray = parseTypedLineErrors(data)
    if (typedArray) {
      return new PartialWriteError(
        error.statusCode,
        error.statusMessage,
        error.body,
        error.contentType,
        error.headers,
        error.message,
        typedArray
      )
    }
    const single = parseSingleLineError(data)
    if (single) {
      return new PartialWriteError(
        error.statusCode,
        error.statusMessage,
        error.body,
        error.contentType,
        error.headers,
        error.message,
        [single]
      )
    }
    return undefined
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
