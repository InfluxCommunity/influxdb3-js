import {
  ConnectionOptions,
  FetchTransport,
  InfluxDBClient,
  Point,
} from '@influxdata/influxdb3-client'
import {randomUUID} from 'node:crypto'
import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport'

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async fetch(_request: any, env: any, _: any) {
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

      // @ts-ignore
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
      const point = Point.measurement(measurement)
        .setTag('Device', 'device')
        .setFloatField('Temperature', 14.0)
        .setStringField('testId', testId)
        .setTimestamp(new Date())
      await influxDB.write(point)

      const query = `Select *
                     from "${measurement}"
                     where "testId" = '${testId}'`
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
