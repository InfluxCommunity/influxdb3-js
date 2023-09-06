import {InfluxDBClient, Point} from '@influxdata/influxdb3-client'

type Defined<T> = Exclude<T, undefined>

/* allows to throw error as expression */
const throwReturn = <T>(err: Error): Defined<T> => {
  throw err
}

/* get environment value or throw error if missing */
const getEnv = (variableName: string): string =>
  process.env[variableName] ??
  throwReturn(new Error(`missing ${variableName} environment variable`))

/* eslint-disable no-console */
async function main() {
  // Use environment variables to initialize client
  const host = getEnv('INFLUXDB_URL')
  const token = getEnv('INFLUXDB_TOKEN')
  const database = getEnv('INFLUXDB_DATABASE')

  // Create a new client using an InfluxDB server base URL and an authentication token
  const client = new InfluxDBClient({host, token})

  try {
    // Write point
    const p = Point.measurement('stat')
      .setTag('unit', 'temperature')
      .setFloatField('avg', 24.5)
      .setFloatField('max', 45.0)
      .setTimestamp(new Date())
    await client.write(p, database)

    // Write point as template with anonymous fields object
    const pointTemplate = Object.freeze(
      Point.measurement('stat').setTag('unit', 'temperature')
    )

    const sensorData = {
      avg: 28,
      max: 40.3,
    }
    const p2 = pointTemplate
      .copy()
      .setFields(sensorData)
      .setTimestamp(new Date())

    await client.write(p2, database)

    // Or write directly line protocol
    const lp = `stat,unit=temperature avg=20.5,max=43.0`
    await client.write(lp, database)

    // Prepare flightsql query
    const query = `
      SELECT *
      FROM "stat"
      WHERE
      time >= now() - interval '5 minute'
      AND
      "unit" IN ('temperature')
    `
    const queryType = 'sql'

    // Execute query
    const queryResult = client.query(query, database, queryType)

    for await (const row of queryResult) {
      console.log(`avg is ${row.avg}`)
      console.log(`max is ${row.max}`)
    }

    // Execute query again as points
    const queryPointsResult = client.queryPoints(
      query,
      database,
      queryType,
      'stat'
    )

    for await (const row of queryPointsResult) {
      console.log(`avg is ${row.getField('avg', 'float')}`)
      console.log(`max is ${row.getField('max', 'float')}`)
    }
  } catch (err) {
    console.error(err)
  } finally {
    await client.close()
  }
}

main()
