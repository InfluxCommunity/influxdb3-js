import './style.css'

import {InfluxDBClient, Point} from '@influxdata/influxdb3-client-browser'
;(async () => {
  // Paste your database
  const database = ''
  // Paste your token
  const token = ''
  // Keep, will be proxied to influx cloud based on your INFLUXDB_URL environment variable
  const host = '/influx'

  const client = new InfluxDBClient({host, token})

  const p = new Point('stat')
    .tag('unit', 'temperature')
    .floatField('avg', 24.5)
    .floatField('max', 45.0)
    .timestamp(new Date())
  await client.write(p, database)

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
})()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
  </div>
`
