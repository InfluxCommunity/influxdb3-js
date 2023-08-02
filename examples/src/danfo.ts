import {
  InfluxDBClient,
  PointRecord,
  collectAll,
} from '@influxdata/influxdb3-client'
import * as dfd from 'danfojs'

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
    // Write record
    const sensorData: PointRecord = {
      measurement: 'stat',
      tags: {
        unit: 'temperature',
      },
      fields: {
        avg: 28,
        max: 40.3,
      },
      timestamp: new Date(),
    }
    await client.write([sensorData], database)

    // Prepare flightsql query
    const query = `
      SELECT *
      FROM "stat"
      WHERE
      time >= now() - interval '50 minute'
      AND
      "unit" IN ('temperature')
    `
    const queryType = 'sql'

    // Execute query
    const queryResult = client.query(query, database, queryType)
    // create array from data
    const data = await collectAll(queryResult)

    const df = new dfd.DataFrame(data)
    df.print()
  } catch (err) {
    console.error(err)
  } finally {
    await client.close()
  }
}

main()
