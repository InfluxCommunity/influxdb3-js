import { InfluxDB, Point } from ".";

const getEnvVariables = () => {
  const {
    TESTING_INFLUXDB_DATABASE,
    TESTING_INFLUXDB_TOKEN,
    TESTING_INFLUXDB_URL,
  } = process.env
  if (
    !TESTING_INFLUXDB_DATABASE ||
    !TESTING_INFLUXDB_TOKEN ||
    !TESTING_INFLUXDB_URL
  )
    throw new Error(
      'env variables has to be set: TESTING_INFLUXDB_DATABASE,TESTING_INFLUXDB_TOKEN,TESTING_INFLUXDB_URL'
    )
  return {
    database: TESTING_INFLUXDB_DATABASE,
    token: TESTING_INFLUXDB_TOKEN,
    url: TESTING_INFLUXDB_URL,
  }
}

;(async () => {
  const {database, token, url} = getEnvVariables()

  const client = new InfluxDB({
    url,
    token,
  })

  const hrtime = process.hrtime()
  const timeInNs = hrtime[0] * 1e9 + hrtime[1]

  const testId = timeInNs
  const avg1 = 23.2
  const max1 = 45.0

  const point = new Point('stat')
    .tag('unit', 'temperature')
    .floatField('avg', avg1)
    .floatField('max', max1)
    .intField('testId', testId)
  // TODO:
  // .timestamp(Date.now())
  client.writePoints([point], database)

  const query = `
  SELECT *
    FROM "stat"
    WHERE
    time >= now() - interval '10 minute'
  `

  const queryType = 'sql'

  client.query(query, database, queryType).next()
})()