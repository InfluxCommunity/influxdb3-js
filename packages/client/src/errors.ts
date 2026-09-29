import {Headers} from './results'

export interface PartialWriteLineError {
  lineNumber: number | undefined
  errorMessage: string
  originalLine: string
}

export const ERROR_HEADER_KEYS = [
  'x-platform-error-code',
  'x-influx-error',
  'x-influxdb-error',
]

function parseLineNumber(value: unknown): number {
  if (value === undefined || value === null) {
    return 0
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  throw new Error('line_number must be number')
}

export function isV3PartialWriteErrorMessage(
  statusCode: number,
  root: any,
  acceptPartial?: boolean,
  useV2Api?: boolean
): boolean {
  // path == '/api/v3/write_lp'
  return (
    statusCode == 400 &&
    acceptPartial != false &&
    !useV2Api &&
    root &&
    typeof root == 'object' &&
    root.error &&
    Array.isArray(root.data) &&
    root.data.length > 0
  )
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
    return null
  }
  const errorMessage = (item as {error_message?: unknown}).error_message
  if (typeof errorMessage !== 'string') {
    return null
  }
  if (errorMessage.length === 0) {
    return null
  }
  let lineNumber
  try {
    if ((item as {line_number?: unknown}).line_number) {
      lineNumber = parseLineNumber(
        (item as {line_number?: unknown}).line_number
      )
      if (lineNumber === null || lineNumber == 0) {
        return null
      }
    }
  } catch (e) {
    return null
  }

  let originalLine = ''
  try {
    originalLine = parseOriginalLine(
      (item as {original_line?: unknown}).original_line
    )
  } catch (e) {
    originalLine = ''
  }

  return {lineNumber, errorMessage, originalLine}
}

function parseTypedLineErrors(
  data: unknown
): [boolean, PartialWriteLineError[]] {
  if (!Array.isArray(data)) {
    return [false, []]
  }

  let allTyped = true
  const lineErrors: PartialWriteLineError[] = []
  for (const item of data) {
    const lineError = parsePartialWriteDataItem(item)
    if (!lineError) {
      allTyped = false
      continue
    }
    lineErrors.push(lineError)
  }

  return [allTyped, lineErrors]
}

function formatTypedLineErrorDetails(
  lineErrors: PartialWriteLineError[]
): string[] {
  const details: string[] = []
  for (const lineError of lineErrors) {
    if (lineError.lineNumber) {
      if (
        lineError.originalLine !== undefined &&
        lineError.originalLine.length > 0
      ) {
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

function formatObjectDataError(dataNode: any, errormsg: string): string {
  if (errormsg == undefined || errormsg == '') {
    return ''
  }

  const lineNumber = dataNode.line_number ?? ''
  const errorMessage = dataNode.error_message ?? ''
  const originalLine = dataNode.original_line ?? ''

  const isLineInteger =
    !isNaN(Number(lineNumber)) &&
    Number.isInteger(Number(lineNumber)) &&
    lineNumber !== ''

  if (errorMessage && (!lineNumber || !isLineInteger)) {
    return `${errormsg}:\n\t${errorMessage}`
  } else if (errorMessage && isLineInteger && !originalLine) {
    return `${errormsg}:\n\tline ${lineNumber}: ${errorMessage}`
  } else if (errorMessage && originalLine) {
    return `${errormsg}:\n\tline ${lineNumber}: ${errorMessage} (${originalLine})`
  }

  return errormsg
}

function formatErrorMessage(node: any): string | undefined {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return undefined
  }

  if (typeof node.message === 'string' && node.message) {
    return node.message
  }

  const errorText = typeof node.error === 'string' ? node.error : undefined
  if (!errorText) {
    return undefined
  }

  const {data} = node
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const formatted = formatObjectDataError(data, errorText)
    if (formatted) {
      return formatted
    }
  }

  return errorText
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
          // Core/Enterprise object format:
          // {"error":"...","data":{"error_message":"..."}}
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
    const json = error.json
    if (
      !json ||
      typeof json !== 'object' ||
      typeof json.error !== 'string' ||
      !json.error ||
      !Array.isArray(json.data) ||
      json.data.length === 0
    ) {
      return undefined
    }

    const {error: errorText, data} = json
    const [allTyped, lineErrors] = parseTypedLineErrors(data)
    const details = allTyped
      ? formatTypedLineErrorDetails(lineErrors)
      : (data as unknown[])
          .map((item: unknown) =>
            item != null ? JSON.stringify(item) : undefined
          )
          .filter(
            (raw: string | undefined): raw is string =>
              raw !== undefined && raw !== '' && raw.toLowerCase() !== 'null'
          )
          .map((raw: string) => `\t${raw}`)

    const message = details.length
      ? `${errorText}:\n${details.join('\n')}`
      : errorText

    return new PartialWriteError(
      error.statusCode,
      error.statusMessage,
      error.body,
      error.contentType,
      error.headers,
      message,
      lineErrors
    )
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
