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
