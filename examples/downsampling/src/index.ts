import {InfluxDBClient} from '@influxdata/influxdb3-client'

/* get environment value or throw error if missing */
const getEnv = (variableName: string): string => {
  if (process.env[variableName] == null)
    throw new Error(`missing ${variableName} environment variable`)
  return process.env[variableName] as string
}

/* eslint-disable no-console */
async function main() {
  //
  // Use environment variables to initialize client
  //
  const host = getEnv('INFLUX_HOST')
  const token = getEnv('INFLUX_TOKEN')
  const database = getEnv('INFLUX_DATABASE')

  //
  // Create a new client using an InfluxDB server base URL and an authentication token
  //
  const client = new InfluxDBClient({host, token, database})

  try {
    //
    // Write data
    //
    await client.write(`stat,unit=temperature avg=24.5,max=45.0`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await client.write(`stat,unit=temperature avg=28,max=40.3`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await client.write(`stat,unit=temperature avg=20.5,max=49.0`)

    //
    // Query downsampled data
    //
    const downSamplingQuery = `\
    SELECT
      date_bin('5 minutes', "time") as window_start,
      AVG("avg") as avg,
      MAX("max") as max
    FROM "stat"
    WHERE
      "time" >= now() - interval '1 hour'
    GROUP BY window_start
    ORDER BY window_start ASC;`

    //
    // Execute downsampling query into pointValues
    //
    const queryPointsResult = client.queryPoints(
      downSamplingQuery,
      database,
      'sql'
    )

    for await (const row of queryPointsResult) {
      const timestamp = new Date(row.getFloatField('window_start') as number)
      console.log(
        `${timestamp.toISOString()}: avg is ${row.getField(
          'avg',
          'float'
        )}, max is ${row.getField('max', 'float')}`
      )

      //
      // write back downsampled date to 'stat_downsampled' measurement
      //
      const downSampledPoint = row
        .asPoint('stat_downsampled')
        .removeField('window_start')
        .setTimestamp(timestamp)

      await client.write(downSampledPoint, database)
    }
  } catch (err) {
    console.error(err)
  } finally {
    await client.close()
  }
}

main()
