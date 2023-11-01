import {InfluxDBClient} from '@influxdata/influxdb3-client'

/**
 * This example shows various ways to instantiate the client.
 * Make sure the following environment variables are set: INFLUX_HOST, INFLUX_TOKEN
 */

/* eslint-disable no-console */
async function main() {

  let client: InfluxDBClient

  // Create a new client using ClientOptions
  client = new InfluxDBClient({
    host: 'http://localhost:8086',
    token: 'my-token',
  })
  await client.close()

  // Create a new client using connection string
  client = new InfluxDBClient('http://localhost:8086?token=my-token')
  await client.close()

  // Create a new client using environment variables
  client = new InfluxDBClient()
  await client.close()
}

main()
