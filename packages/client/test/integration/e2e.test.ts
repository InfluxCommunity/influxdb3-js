import NodeHttpTransport from '../../src/impl/node/NodeHttpTransport'
import nock from 'nock'
import {expect} from 'chai'
import {InfluxDBClient, Point, PointValues} from '../../src'
import {rejects} from 'assert'
import * as http from 'node:http'
import {iterateTestData, sendTestData} from '../util'
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
  describe('with environment variables', () => {
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

      const query = `SELECT *
                   FROM "stat"
                   WHERE "testId" = ${testId}`

      const data = client.query(query, database)

      let row: IteratorResult<Record<string, any>, void>
      row = await data.next()

      expect(row.done).to.equal(false)
      expect(row.value?.unit).to.equal('temperature')
      expect(row.value?.avg).to.equal(avg1)
      expect(row.value?.max).to.equal(max1)

      row = await data.next()
      expect(row.done).to.equal(true)

      let dataPoints = client.queryPoints(query, database)

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

      dataPoints = client.queryPoints(queryAggregation, database)

      pointRow = await dataPoints.next()

      expect(pointRow.done).to.equal(false)
      expect(pointRow.value?.getField('sum_avg')).to.equal(avg1)
      expect(pointRow.value?.getField('sum_max')).to.equal(max1)

      await client.close()
      await rejects(client.query(query, database).next())
    }).timeout(10_000)

    it('should not duplicate query results', async () => {
      const {database, token, url} = getEnvVariables()
      const client = new InfluxDBClient({
        host: url,
        token: token,
        database: database,
      })

      const time1 = `t${Date.now()}`
      const time2 = `t${Date.now() + 1000}`
      await client.write(`
          weathers,location=A temperature=0i,test_id="${time1}"
          weathers,location=B temperature=1i,test_id="${time2}"
          `)
      const query = `
      SELECT location, temperature, test_id
      FROM "weathers"
      WHERE test_id = '${time1}' OR test_id = '${time2}';
    `
      const queryResult = client.query(query)
      const rows = []
      for await (const row of queryResult) {
        rows.push(row)
      }
      expect(rows.length).to.equal(2)
      expect(rows[0].test_id).to.not.equal(rows[1].test_id)
    }).timeout(5000)

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
      const paralelQueries = 8

      const datas = await Promise.all(
        range(paralelQueries)
          .map(() => client.queryPoints(query, database))
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
      const queryValues: typeof values = []

      for (let tries = 10; tries--; ) {
        const data = client.queryPoints(query, database)

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

    it('queryPoints with getMappedValue', async () => {
      const {database, token, url} = getEnvVariables()

      const client = new InfluxDBClient({
        host: url,
        token,
        writeOptions: {
          precision: 'ms',
        },
      })

      const time = Date.now()
      const testId = getRandomInt(0, 100000000)
      await client.write(
        `host15,tag=empty name="intel",mem_total=2048,disk_free=100i,temperature=100.86,isActive=true,testId="${testId}" ${time}`,
        database
      )

      const sql = `Select *
                 from host15
                 where "testId" = ${testId}`
      const dataPoints = client.queryPoints(sql, database)

      const pointRow: IteratorResult<PointValues, void> =
        await dataPoints.next()

      expect(pointRow.value?.getField('name')).to.equal('intel')
      expect(pointRow.value?.getFieldType('name')).to.equal('string')

      expect(pointRow.value?.getField('mem_total')).to.equal(2048)
      expect(pointRow.value?.getFieldType('mem_total')).to.equal('float')

      expect(pointRow.value?.getField('disk_free')).to.equal(100)
      expect(pointRow.value?.getFieldType('disk_free')).to.equal('integer')

      expect(pointRow.value?.getField('temperature')).to.equal(100.86)
      expect(pointRow.value?.getFieldType('temperature')).to.equal('float')

      expect(pointRow.value?.getField('isActive')).to.equal(true)
      expect(pointRow.value?.getFieldType('isActive')).to.equal('boolean')

      await client.close()
    }).timeout(10_000)

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

    async function writeFrameSamples(client: InfluxDBClient, database: string) {
      const time = Date.now()

      let lp = ''

      for (let i = 0; i < samples.length; i++) {
        lp +=
          `${samples[i].measurement},work=${samples[i].work},` +
          `director=${samples[i].director} reel=${samples[i].reel}i,` +
          `lumens=${samples[i].lumens},integ=${samples[i].integrity},` +
          `sound=${samples[i].sound},quality="${samples[i].quality}"` +
          ` ${time - i * 60000}`
        if (i < samples.length - 1) {
          lp += '\n'
        }
      }

      await client.write(lp, database)
    }

    it('queries with parameters', async () => {
      const {database, token, url} = getEnvVariables()

      const client = new InfluxDBClient({
        host: url,
        token,
        writeOptions: {
          precision: 'ms',
        },
      })

      await writeFrameSamples(client, database)

      await sleep(3_000)

      const query = `
        SELECT *
        FROM "${samples[0].measurement}"
        WHERE
            time >= now() - interval '10 minute'
          AND
            "director" = $director
    `
      const data = client.query(query, database, {
        type: 'sql',
        params: {director: 'J_Ford'},
      })

      let count = 0
      for await (const row of data) {
        count++
        expect(row['director']).to.equal('J_Ford')
      }
      expect(count).to.be.greaterThan(0)
    }).timeout(10_000)

    it('queries to points with parameters', async () => {
      const {database, token, url} = getEnvVariables()

      const client = new InfluxDBClient({
        host: url,
        token,
        writeOptions: {
          precision: 'ms',
        },
      })

      await writeFrameSamples(client, database)

      await sleep(3_000)

      const query = `
        SELECT *
        FROM "${samples[0].measurement}"
        WHERE
            time >= now() - interval '10 minute'
          AND
            "director" = $director
    `
      const points = client.queryPoints(query, database, {
        type: 'sql',
        params: {director: 'N_Ray'},
      })

      let count = 0
      for await (const point of points) {
        count++
        expect(point.getTag('director')).to.equal('N_Ray')
      }
      expect(count).to.be.greaterThan(0)
    }).timeout(7_000)

    it('queryies to points using influxql', async () => {
      const {database, token, url} = getEnvVariables()
      const client = new InfluxDBClient({
        host: url,
        token,
        writeOptions: {
          precision: 'ms',
        },
        queryOptions: {
          type: 'influxql',
        },
      })
      await writeFrameSamples(client, database)

      await sleep(3_000)

      const query = `SELECT *
                   FROM "frame"
                   WHERE
                       time
                       > now() - 1h
                     AND
                       "director" = 'H_Hathaway'`

      const points = client.queryPoints(query, database)

      let count = 0
      for await (const point of points) {
        count++
        expect(point.getTag('director')).to.equal('H_Hathaway')
      }
      expect(count).to.be.greaterThan(0)
    }).timeout(7_000)
  })
  describe('with node http', () => {
    it('is aborted before the whole response arrives', async () => {
      const port = 9000
      const url = `http://localhost:${port}`
      const transportOptions = {host: url}
      const server = http
        .createServer((req, res) => {
          if (req.url === '/test') {
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'Transfer-Encoding': 'chunked',
              Connection: 'keep-alive',
            })
            res.flushHeaders()

            let count = 0
            for (let i = 0; i < 3; i++) {
              if (count < 2) {
                res.write(`Chunk ${count}\n`)
                count++
              } else {
                res.destroy()
              }
            }
          }

          res.end()
        })
        .listen(port, () => console.log(`Server running on ${url}`))

      await sendTestData(transportOptions, {method: 'GET'})
        .then((_data) => {
          expect.fail('not expected!')
        })
        .catch((e: any) => {
          expect(e).property('message').to.include('aborted')
        })

      server.close()
    }).timeout(7_000)

    it('is aborted before the whole response arrives with iterateTestData', async () => {
      const port = 9000
      const url = `http://localhost:${port}`
      const transportOptions = {host: url}
      const server = http
        .createServer((req, res) => {
          if (req.url === '/test') {
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'Transfer-Encoding': 'chunked',
              Connection: 'keep-alive',
            })
            res.flushHeaders()

            let count = 0
            for (let i = 0; i < 3; i++) {
              if (count < 2) {
                res.write(`Chunk ${count}\n`)
                count++
              } else {
                res.destroy()
              }
            }
          }
          res.end()
        })
        .listen(port, () => console.log(`Server running on ${url}`))

      await iterateTestData(transportOptions, {method: 'GET'})
        .then((_data) => {
          expect.fail('not expected!')
        })
        .catch((e: any) => {
          expect(e).property('message').to.include('aborted')
        })

      server.close()
    }).timeout(7_000)
    //
    it(`signalizes error upon request's error'`, async () => {
      const port = 9000
      const url = `http://localhost:${port}`
      const transportOptions = {host: url}
      const server = http
        .createServer((req, res) => {
          if (req.url === '/test') {
            req.destroy(new Error('request failed'))
          }
          res.end()
        })
        .listen(port, () => console.log(`Server running on ${url}`))

      await sendTestData(transportOptions, {method: 'GET'})
        .then((_data) => {
          expect.fail('not expected!')
        })
        .catch((e: any) => {
          expect(e).property('message').to.include('socket hang up')
        })

      server.close()
    }).timeout(7_000)

    it(`signalizes error upon request's error with iterateTestData`, async () => {
      const port = 9000
      const url = `http://localhost:${port}`
      const transportOptions = {host: url}
      const server = http
        .createServer((req, res) => {
          if (req.url === '/test') {
            req.destroy(new Error('request failed'))
          }
          res.end()
        })
        .listen(port, () => console.log(`Server running on ${url}`))

      await iterateTestData(transportOptions, {method: 'GET'})
        .then((_data) => {
          expect.fail('not expected!')
        })
        .catch((e: any) => {
          expect(e).property('message').to.include('socket hang up')
        })

      server.close()
    }).timeout(7000)

    it(`communicates through a proxy`, async () => {
      nock.restore()
      const headers: {host: string | undefined} = {host: undefined}
      const port = 9000
      const url = `http://localhost:${port}`
      const targetUrl = 'http://target:3000'

      const server = http
        .createServer((req, res) => {
          res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
          })
          res.flushHeaders()

          headers.host = req.headers.host
          res.write('..')
          res.end()
        })
        .listen(port, () => console.log(`Server running on ${url}`))

      const data = await new NodeHttpTransport({
        host: targetUrl,
        proxyUrl: url,
      }).request('/test', '', {
        method: 'GET',
      })

      expect(headers?.host).equals('target:3000')
      expect(data).equals('..')

      server.close()
      nock.activate()
    }).timeout(7000)
  })
})
