import {ConnectionOptions, InfluxDBClient, Point} from '../../../src'
import FetchTransport from '../../../src/impl/browser/FetchTransport'
import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'
import {randomUUID} from 'node:crypto'

export default {
  async fetch(request: any, env: any, ctx: any) {
    let influxDB
    try {
      // These env is from wrangler.json file
      const database = env.TESTING_INFLUXDB_DATABASE
      const token = env.TESTING_INFLUXDB_TOKEN
      const url = env.TESTING_INFLUXDB_URL

      const connectionOptions: ConnectionOptions = {
        host: url,
        token: token,
        database: database,
      }
      influxDB = new InfluxDBClient({
        ...connectionOptions,
        writeTransport: new FetchTransport({
          host: connectionOptions.host,
          token: connectionOptions.token,
        }),
        queryTransport: new GrpcWebFetchTransport({
          baseUrl: connectionOptions.host,
        }),
      })
      const testId = randomUUID()
      const measurement = 'demoBrowser2'
      let point = Point.measurement(measurement)
        .setTag('Device', 'device')
        .setFloatField('Temperature', 14.0)
        .setStringField('testId', testId)
        .setTimestamp(new Date())
      await influxDB.write(point)

      const query = `Select *
                     from \"${measurement}\"
                     where \"testId\" = '${testId}'`
      const points = influxDB.queryPoints(query)
      const p = await points.next()
      return Response.json(p)
    } catch (e: any) {
      console.error(e)
      return new Response(null, {status: 500})
    } finally {
      await influxDB?.close()
    }
  },
}
