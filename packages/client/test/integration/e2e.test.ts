import {expect} from 'chai'
import {InfluxDBClient, Point} from '../../src'
import {rejects} from 'assert'
import {PointValues} from '../../src'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
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
      'env variables have to be set: TESTING_INFLUXDB_DATABASE,TESTING_INFLUXDB_TOKEN,TESTING_INFLUXDB_URL'
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

    const query = `SELECT * FROM "stat" WHERE "testId" = ${testId}`

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
  }).timeout(10_000)

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
        .setTimestamp(time + i * 1_000)
    )
    await client.write(points, database)

    await sleep(2_000)

    const query = `
      SELECT *
        FROM "stat"
        WHERE
        time >= now() - interval '10 minute'
        AND
        "testId" = ${testId}
    `

    const queryType = 'sql'

    const paralelQueries = 8

    const datas = await Promise.all(
      range(paralelQueries)
        .map(() => client.queryPoints(query, database, queryType))
        .map(async (data) => {
          const queryValues: typeof values = []

          for (let tries = 10; tries--; ) {
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
            if (queryValues.length === values.length) break
            // eslint-disable-next-line no-console
            console.log('query failed. retrying')

            queryValues.splice(0)
            await sleep(2_000)
          }

          return queryValues
        })
    )

    for (const data of datas) {
      expect(data.length).to.equal(values.length)
    }

    await client.close()
  }).timeout(20_000)

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
        .setTimestamp(time + i * 1_000)
    )
    await client.write(points, database)

    // wait for data to be written
    await sleep(5_000)

    const query = `
      SELECT *
        FROM "stat"
        WHERE
        time >= now() - interval '10 minute'
        AND
        "testId" = ${testId}
    `

    const queryType = 'sql'

    const queryValues: typeof values = []

    for (let tries = 10; tries--; ) {
      const data = client.queryPoints(query, database, queryType)

      for await (const row of data) {
        queryValues.push({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          avg: row.getFloatField('avg')!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          max: row.getFloatField('max')!,
        })
      }

      if (queryValues.length === values.length) break
      // eslint-disable-next-line no-console
      console.log('query failed. retrying')

      queryValues.splice(0)
      await sleep(2_000)
    }

    expect(queryValues.length).to.equal(values.length)

    await client.close()
  }).timeout(40_000)

  it('queries with parameters', async () => {
    const samples = [
      {
        measurement: 'frame',
        work: 'FortApache',
        director: 'J_Ford',
        reel: 7,
        lumens: Math.PI,
        integrity: 0.7,
        sound: 4.5,
        quality: 'Average',
      },
      {
        measurement: 'frame',
        work: 'Searchers',
        director: 'J_Ford',
        reel: 12,
        lumens: 2 * Math.E,
        integrity: 0.9,
        sound: 0.07,
        quality: 'Good',
      },
      {
        measurement: 'frame',
        work: 'BiggerThanLife',
        director: 'N_Ray',
        reel: 3,
        lumens: 0.432,
        integrity: 0.81,
        sound: 2.5,
        quality: 'Good',
      },
      {
        measurement: 'frame',
        work: 'Niagara',
        director: 'H_Hathaway',
        reel: 8,
        lumens: 5.34,
        integrity: 0.45,
        sound: 3.03,
        quality: 'Poor',
      },
      {
        measurement: 'frame',
        work: 'JohnnyGuitar',
        director: 'N_Ray',
        reel: 6,
        lumens: 7.25,
        integrity: 0.93,
        sound: 1.07,
        quality: 'Excellent',
      },
    ]

    const {database, token, url} = getEnvVariables()

    const time = Date.now()

    let lp = ''

    for (let i = 0; i < samples.length; i++) {
      lp += `${samples[i].measurement},work=${samples[i].work},director=${samples[i].director} reel=${samples[i].reel}i,lumens=${samples[i].lumens},integ=${samples[i].integrity},sound=${samples[i].sound},quality="${samples[i].quality}" ${time - i * 60000}`
      if (i < samples.length - 1) {
        lp += '\n'
      }
    }

    const client = new InfluxDBClient({
      host: url,
      token,
      writeOptions: {
        precision: 'ms',
      },
    })

    await client.write(lp, database)

    await sleep(1_000)

    const query = `
      SELECT *
        FROM "${samples[0].measurement}"
        WHERE
        time >= now() - interval '10 minute'
        AND
        "director" = $director    
    `
    const data = client.query(
      query,
      database,
      'sql',
      new Map([['director', 'J_Ford']])
    )

    for await (const row of data) {
      expect(row['director']).to.equal('J_Ford')
      expect(row['work'])
    }
  })
})
