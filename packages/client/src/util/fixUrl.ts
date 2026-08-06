const HTTP_PREFIX = 'http://'
const HTTPS_PREFIX = 'https://'

/**
 * replaceURLProtocolWithPort removes the "http://" or "https://" protocol from the given URL and replaces it with the port number.
 * Currently, Apache Arrow does not support the "http://" or "https://" protocol in the URL, so this function is used to remove it.
 * If a port number is already present in the URL, only the protocol is removed.
 * The function also returns a boolean value indicating whether the communication is safe or unsafe.
 * - If the URL starts with "https://", the communication is considered safe, and the returned boolean value will be true.
 * - If the URL starts with "http://", the communication is considered unsafe, and the returned boolean value will be false.
 * - If the URL does not start with either "http://" or "https://", the returned boolean value will be undefined.
 *
 * @param url - The URL to process.
 * @returns An object containing the modified URL with the protocol replaced by the port and a boolean value indicating the safety of communication (true for safe, false for unsafe) or undefined if not detected.
 */
export const replaceURLProtocolWithPort = (
  url: string
): {url: string; safe: boolean | undefined} => {
  url = url.replace(/\/$/, '')

  let safe: boolean | undefined

  if (url.startsWith(HTTP_PREFIX)) {
    url = url.slice(HTTP_PREFIX.length)
    safe = false

    if (!url.includes(':')) {
      url = `${url}:80`
    }
  } else if (url.startsWith(HTTPS_PREFIX)) {
    url = url.slice(HTTPS_PREFIX.length)
    safe = true

    if (!url.includes(':')) {
      url = `${url}:443`
    }
  }

  return {url, safe}
}

/**
 * parseUrl parses the given URL string and returns an object containing its components.
 * It handles both IPv4 and IPv6 addresses, and provides default ports (80 for http, 443 for https) if none are specified.
 *
 * @param url - The URL string to parse.
 * @returns An object containing:
 *  - rawUrl: The original URL string.
 *  - protocol: The protocol (e.g., 'http:', 'https:').
 *  - host: The hostname and port (e.g., 'example.com:80', '[::1]:443').
 *  - hostname: The hostname (e.g., 'example.com', '[::1]').
 *  - port: The port number as a string.
 *  - pathname: The URL path (e.g., '/').
 *  - searchParams: A URLSearchParams object containing the query parameters.
 */
export const parseUrl = (
  url: string
): {
  rawUrl: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  searchParams: URLSearchParams
} => {
  let hostname = ''
  let port = ''
  if (!url || url.trim() === '') {
    return {
      rawUrl: url,
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      searchParams: new URLSearchParams(),
    }
  }

  // If URL is a IPv6 address
  const bracketStart = url.indexOf('[')
  const bracketEnd = url.indexOf(']')
  let tmpUrl = url
  const isIpv6 = bracketStart != -1 && bracketEnd !== -1
  if (isIpv6) {
    hostname = url.substring(bracketStart, bracketEnd + 1)

    // Temporally set the hostname to [::] so It will not throw "Invalid URL" when passing it into `new URL(url)`
    tmpUrl = url.replace(hostname, '[::]')
  }

  const u = new URL(tmpUrl)
  port = u.port
  if (port === '') {
    port = u.protocol.startsWith('https') ? '443' : '80'
  }

  if (!isIpv6) {
    hostname = u.hostname
  }

  return {
    rawUrl: url,
    protocol: u.protocol,
    host: `${hostname}:${port}`,
    hostname: hostname,
    port: port,
    pathname: u.pathname,
    searchParams: u.searchParams,
  }
}
