import {expect} from 'chai'
import {InfluxDBClient, Point} from '../../src'

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

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

describe('e2e test', () => {
  it('write and query data', async () => {
    const {database, token, url} = getEnvVariables()

    const client = new InfluxDBClient({
      host: url,
      token,
    })

    const testId = getRandomInt(0, 100000000)
    const avg1 = getRandomInt(110, 500)
    const max1 = getRandomInt(900, 1000)

    const point = new Point('stat')
      .tag('unit', 'temperature')
      .floatField('avg', avg1)
      .floatField('max', max1)
      .intField('testId', testId)
    await client.write(point, database)

    const query = `
      SELECT *
        FROM "stat"
        WHERE
        time >= now() - interval '10 minute'
        AND
        "testId" = ${testId}
        ORDER BY time
    `

    const queryType = 'sql'

    const data = client.query(query, database, queryType)

    let row: IteratorResult<Record<string, any>, void>
    row = await data.next()

    expect(row.done).to.equal(false)
    expect(row.value?.unit).to.equal('temperature')
    expect(row.value?.avg).to.equal(avg1)
    expect(row.value?.max).to.equal(max1)

    row = await data.next()
    expect(row.done).to.equal(true)
  })
})
