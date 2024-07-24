import {InfluxDBClient, Point, HttpError} from '@influxdata/influxdb3-client'

/**
 * This example seeks to exceed the write limit of a standard unpaid
 * influxdb account.  Run it from the command line a couple of times in
 * succession (e.g. `yarn retry`).  The first run should succeed, but
 * the second run should exceed the max write limit and the server should
 * return 429 with a `retry-after` header.
 */
async function main() {
  const host = getEnv('INFLUX_HOST')
  const token = getEnv('INFLUX_TOKEN')
  const database = getEnv('INFLUX_DATABASE')

  const client = new InfluxDBClient({host, token})

  const points: Point[] = []
  const now = new Date()
  for (let i = 100000; i > -1; i--) {
    const d: Date = new Date(now.getTime() - 100 * i)
    points[i] = UserMemUsage.RandomUserMemUsage().toPoint(d)
  }
  await writeData(client, points, database, 1)
}

/**
 * Returns the retry interval in milliseconds
 *
 * @param retry string or string[] from `retry-after` header
 */
function getRetryInterval(retry: string | string[]): number {
  const token = retry.toString()
  let result: number = parseInt(token)
  if (isNaN(result)) {
    const now: Date = new Date()
    const exp: Date = new Date(token)
    if (isNaN(exp.valueOf())) {
      throw new Error(`Failed to parse retry value: ${retry}`)
    }
    result = exp.getTime() - now.getTime()
  } else {
    result *= 1000
  }
  return result
}

let initialRetry: number

/**
 * Helper function to leverage `retry-after` in the event a HttpError
 * is returned.
 *
 * @param client an InfluxDBClient instance
 * @param data data to be written
 * @param database target database
 * @param retryCount number of times to retry writing data
 */
async function writeData(
  client: InfluxDBClient,
  data: Point | Point[],
  database: string,
  retryCount = 0
) {
  if (initialRetry == null) {
    initialRetry = retryCount
  }
  try {
    await client.write(data, database)
    console.log(`Write success on try ${1 + initialRetry - retryCount}`)
  } catch (error: any) {
    if (
      error instanceof HttpError &&
      error.headers &&
      error?.headers['retry-after']
    ) {
      console.log(
        `WARNING[${new Date()}]: Caught error ${JSON.stringify(error)}`
      )
      if (retryCount > 0) {
        // add an extra second to be sure
        const interval = getRetryInterval(error?.headers['retry-after']) + 1000
        console.log(`Retrying in ${interval} ms`)
        setTimeout(() => {
          writeData(client, data, database, retryCount - 1)
        }, interval)
      } else {
        console.log(
          `ERROR[${new Date()}]: Failed to write data after ${initialRetry} attempts.`
        )
      }
    }
  }
}

type Defined<T> = Exclude<T, undefined>

/* allows to throw error as expression */
const throwReturn = <T>(err: Error): Defined<T> => {
  throw err
}

/* get environment value or throw error if missing */
const getEnv = (variableName: string): string =>
  process.env[variableName] ??
  throwReturn(new Error(`missing ${variableName} environment variable`))

class UserMemUsage {
  name: string
  location: string
  pct: number
  procCt: number
  state: string

  constructor(
    name: string,
    location: string, // as tag
    pct: number,
    procCt: number, // as integer
    state: string
  ) {
    this.name = name
    this.location = location
    this.pct = pct
    this.procCt = procCt
    this.state = state
  }

  static dieRoll(): number {
    return Math.floor(Math.random() * 6) + 1
  }

  static RandomUserMemUsage(
    name = 'userMem',
    location = 'hic',
    states = ['OK', 'WARNING', 'EXCEEDED', 'CRITICAL', 'ERROR']
  ): UserMemUsage {
    return new UserMemUsage(
      name,
      location,
      Math.random() * 100,
      this.dieRoll() + this.dieRoll() + this.dieRoll(),
      states[Math.floor(Math.random() * states.length)]
    )
  }

  toPoint(date: Date): Point {
    return Point.measurement(this.name)
      .setTag('location', this.location)
      .setFloatField('percent', this.pct)
      .setIntegerField('processCount', this.procCt)
      .setStringField('state', this.state)
      .setTimestamp(date)
  }
}

main().then(() => {
  console.log('DONE')
})
