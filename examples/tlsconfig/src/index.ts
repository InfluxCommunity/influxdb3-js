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
  // Create a new client with TLS configuration.
  //
  const client = new InfluxDBClient({
    host,
    token,
    database,
    serverCertPath: 'path/to/your/server.crt', // Config server certificate for TLS.

    // Optional. Config mTLS with client certificate and key files.
    // clientCertPath: 'path/to/your/client.crt',
    // clientKeyPath: 'path/to/your/client.key',

    // Optional. If you have a .pem file bundle certificate and key inside, set clientCertPath and clientKeyPath with that same file path.
    // clientCertPath: "path/to/your/client.pem",
    // clientKeyPath: "path/to/your/client.pem",
  })

  try {
    //
    // Write data
    //
    await client.write(`demoDS,unit=temperature avg=24.5,max=45.0`)
  } catch (err) {
    console.error(err)
  } finally {
    await client.close()
  }
}

main()
