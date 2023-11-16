import {expect} from 'chai'
import {InfluxDBClient, Point} from '../../src'
import {rejects} from 'assert'
import {PointValues} from '../../src'

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

const range: {
  (max: number): number[]
  (min: number, max: number, step?: number): number[]
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
} = (n: number, n1?: number, step: number = 1): number[] => {
  const length = n1 === undefined ? n : Math.max(Math.ceil((n1 - n) / step), 0)

  return length >= 0
    ? Array.from(Array(length).keys()).map(
        n1 === undefined ? (x) => x : (x) => x * step + n
      )
    : []
}

const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

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

    const point = Point.measurement('stat')
      .setTag('unit', 'temperature')
      .setFloatField('avg', avg1)
      .setFloatField('max', max1)
      .setIntegerField('testId', testId)
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

    let dataPoints = client.queryPoints(query, database, queryType)

    let pointRow: IteratorResult<PointValues, void>
    pointRow = await dataPoints.next()

    expect(pointRow.done).to.equal(false)
    expect(pointRow.value?.getField('avg')).to.equal(avg1)
    expect(pointRow.value?.getField('max')).to.equal(max1)

    pointRow = await dataPoints.next()
    expect(pointRow.done).to.equal(true)

    //
    // test aggregation query
    //
    const queryAggregation = `
    SELECT sum("avg") as "sum_avg", sum("max") as "sum_max"
        FROM "stat"
        WHERE "testId" = ${testId}
    `

    dataPoints = client.queryPoints(queryAggregation, database, queryType)

    pointRow = await dataPoints.next()

    expect(pointRow.done).to.equal(false)
    expect(pointRow.value?.getField('sum_avg')).to.equal(avg1)
    expect(pointRow.value?.getField('sum_max')).to.equal(max1)

    await client.close()
    await rejects(client.query(query, database, queryType).next())
  })

  it('concurrent query', async () => {
    const {database, token, url} = getEnvVariables()

    const client = new InfluxDBClient({
      host: url,
      token,
      writeOptions: {
        precision: 'ms',
      },
    })

    const testId = getRandomInt(0, 100000000)
    const values = range(50).map(() => ({
      avg: getRandomInt(110, 500),
      max: getRandomInt(900, 1000),
    }))

    const time = Date.now()
    const points = values.map(({avg, max}, i) =>
      Point.measurement('stat')
        .setTag('unit', 'temperature')
        .setFloatField('avg', avg)
        .setFloatField('max', max)
        .setIntegerField('testId', testId)
        .setTimestamp(time + i * 100)
    )
    await client.write(points, database)

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

    const paralelQueries = 8

    const datas = await Promise.all(
      range(paralelQueries)
        .map(() => client.queryPoints(query, database, queryType))
        .map(async (data) => {
          const queryValues: typeof values = []
          for await (const row of data) {
            queryValues.push({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              avg: row.getFloatField('avg')!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              max: row.getFloatField('max')!,
            })
            // Introduce concurrency: try to process more streams at once and switch between them
            await sleep(10)
          }
          return queryValues
        })
    )

    for (const data of datas) {
      expect(data).to.deep.equal(values)
    }

    await client.close()
  }).timeout(10_000)

  it('big query', async () => {
    const {database, token, url} = getEnvVariables()

    const client = new InfluxDBClient({
      host: url,
      token,
      writeOptions: {
        precision: 'ms',
      },
    })

    const testId = getRandomInt(0, 100000000)
    const values = range(5_000).map(() => ({
      avg: getRandomInt(110, 500),
      max: getRandomInt(900, 1000),
    }))

    const time = Date.now()
    const points = values.map(({avg, max}, i) =>
      Point.measurement('stat')
        .setTag('unit', 'temperature')
        .setFloatField('avg', avg)
        .setFloatField('max', max)
        .setIntegerField('testId', testId)
        .setTimestamp(time + i * 100)
    )
    await client.write(points, database)

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

    const data = client.queryPoints(query, database, queryType)

    const queryValues: typeof values = []
    for await (const row of data) {
      queryValues.push({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        avg: row.getFloatField('avg')!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        max: row.getFloatField('max')!,
      })
    }
    expect(queryValues.length).to.equal(values.length)
    expect(queryValues).to.deep.equal(values)

    await client.close()
  }).timeout(10_000)
})
