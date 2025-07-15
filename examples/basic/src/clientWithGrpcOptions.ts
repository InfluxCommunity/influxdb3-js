import {InfluxDBClient} from '@influxdata/influxdb3-client'

/*
This example shows the ways in which grpc options can be defined
when the client is instantiated.

See the @grpc/grpc-js dependency for valid option strings
*/

async function main() {
  let client: InfluxDBClient

  // declare grpcOptions directly in client options
  client = new InfluxDBClient({
    host: 'http://localhost:8086',
    token: 'my-token',
    grpcOptions: {
      'grpc.max_receive_message_length': 1024 * 1024 * 5,
      'grpc.max_send_message_length': 65536,
    },
  })
  console.log(`peek options ${JSON.stringify(client['_options'])}`)
  await client.close()

  // declare grpcOptions as a part of queryOptions
  client = new InfluxDBClient({
    host: 'http://localhost:8086',
    token: 'my-token',
    queryOptions: {
      grpcOptions: {
        'grpc.max_receive_message_length': 1024 * 1024 * 10,
        'grpc.max_send_message_length': 65536,
      },
    },
  })
  console.log(`peek options ${JSON.stringify(client['_options'])}`)
  await client.close()

  if (!process.env['INFLUX_HOST']) {
    process.env['INFLUX_HOST'] = 'http://localhost:8086'
  }

  if (!process.env['INFLUX_TOKEN']) {
    process.env['INFLUX_TOKEN'] = 'my-token'
  }

  // declare grpc options using the environment variable INFLUX_GRPC_OPTIONS
  process.env['INFLUX_GRPC_OPTIONS'] =
    'grpc.max_receive_message_length=65536,grpc.max_send_message_length=65536'

  client = new InfluxDBClient()
  console.log(`peek options ${JSON.stringify(client['_options'])}`)
  await client.close()

  delete process.env['INFLUX_GRPC_OPTIONS']
}

main().then(() => {
  console.log('DONE')
})
