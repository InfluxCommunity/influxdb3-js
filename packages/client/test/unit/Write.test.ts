import {expect} from 'chai'
import nock from 'nock' // WARN: nock must be imported before NodeHttpTransport, since it modifies node's http
import {
  ClientOptions,
  HttpError,
  WriteOptions,
  Point,
  InfluxDBClient,
  WritePrecision,
} from '../../src'
import {collectLogging, CollectedLogs, unhandledRejections} from '../util'
import zlib from 'zlib'
import {rejects} from 'assert'
import {isDefined} from '../../src/util/common'

const clientOptions: ClientOptions = {
  url: 'http://fake:8086',
  token: 'a',
}
const BUCKET = 'bucket'
const PRECISION: WritePrecision = 's'

const WRITE_PATH_NS = `/api/v2/write?bucket=${BUCKET}&precision=ns`

function createApi(options: Partial<WriteOptions>): InfluxDBClient {
  return new InfluxDBClient({
    ...clientOptions,
    ...{writeOptions: options},
  })
}

describe('Write', () => {
  beforeEach(() => {
    nock.disableNetConnect()
    unhandledRejections.before()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
    unhandledRejections.after()
  })
  describe('simple', () => {
    let subject: InfluxDBClient
    let logs: CollectedLogs
    beforeEach(() => {
      subject = createApi({
        precision: PRECISION,
      })
      logs = collectLogging.replace()
    })
    afterEach(async () => {
      // eslint-disable-next-line no-console
      await subject.close().catch(console.error)
      collectLogging.after()
    })
    it('can be closed without any data', async () => {
      await subject.close().catch((e) => expect.fail('should not happen', e))
    })
    it('fails to write without server connection', async () => {
      await subject
        .write(BUCKET, 'test value=1')
        .then(() => expect.fail('failure expected'))
        .catch((e) => {
          expect(logs.error).length.greaterThan(0)
          expect(e).to.be.ok
        })
    })
    it('fails on write if it is closed already', async () => {
      await subject.close()

      await rejects(subject.write(BUCKET, 'text value=1'))
      await rejects(subject.write(BUCKET, ['text value=1', 'text value=2']))
      await rejects(
        subject.writePoints(BUCKET, new Point('test').floatField('value', 1))
      )
      await rejects(
        subject.writePoints(BUCKET, [new Point('test').floatField('value', 1)])
      )
    })
  })
  describe('convert point time to line protocol', () => {
    const client = createApi({
      precision: 'ms',
    })
    it('converts empty string to no timestamp', () => {
      const p = new Point('a').floatField('b', 1).timestamp('')
      expect(p.toLineProtocol(client.convertTime)).equals('a b=1')
    })
    it('converts number to timestamp', () => {
      const p = new Point('a').floatField('b', 1).timestamp(1.2)
      expect(p.toLineProtocol(client.convertTime)).equals('a b=1 1')
    })
    it('converts Date to timestamp', () => {
      const d = new Date()
      const p = new Point('a').floatField('b', 1).timestamp(d)
      expect(p.toLineProtocol(client.convertTime)).equals(
        `a b=1 ${d.getTime()}`
      )
    })
    it('converts undefined to local timestamp', () => {
      const p = new Point('a').floatField('b', 1)
      expect(p.toLineProtocol(client.convertTime)).satisfies((x: string) => {
        return x.startsWith('a b=1')
      }, `does not start with 'a b=1'`)
      expect(p.toLineProtocol(client.convertTime)).satisfies((x: string) => {
        return Date.now() - Number.parseInt(x.substring('a b=1 '.length)) < 1000
      })
    })
  })
  describe('usage of server API', () => {
    let subject: InfluxDBClient
    let logs: CollectedLogs
    function useSubject(writeOptions: Partial<WriteOptions>): void {
      subject = createApi({
        ...writeOptions,
      })
    }
    beforeEach(() => {
      logs = collectLogging.replace()
    })
    afterEach(async () => {
      subject.close()
      collectLogging.after()
    })
    ;[false, true].map((useGZip) => {
      it(
        useGZip
          ? 'writes records without errors'
          : 'writes gziped records without errors',
        async () => {
          useSubject(
            useGZip
              ? {
                  gzipThreshold: 0,
                }
              : {}
          )
          let requests = 0
          let failNextRequest = false
          const messages: string[] = []
          nock(clientOptions.url)
            .post(WRITE_PATH_NS)
            .reply(function (_uri, requestBody) {
              requests++
              if (failNextRequest) {
                failNextRequest = false
                return [429, '', {'retry-after': '1'}]
              } else {
                let plain = requestBody.toString()
                if (this.req.headers['content-encoding'] == 'gzip') {
                  plain = zlib
                    .gunzipSync(Buffer.from(requestBody.toString(), 'hex'))
                    .toString()
                }
                messages.push(plain.toString())
                return [204, '', {'retry-after': '1'}]
              }
            })
            .persist()
          const point = new Point('test')
            .tag('t', ' ')
            .floatField('value', 1)
            .timestamp('')

          failNextRequest = true
          await subject
            .writePoints(BUCKET, point)
            .then(() => expect.fail('failure expected'))
            .catch((e) => {
              expect(e).to.be.ok
            })
          expect(logs.error).has.length(1)
          expect(logs.warn).has.length(0)
          logs.reset()

          await subject.writePoints(BUCKET, point)
          expect(logs.error).has.length(0)
          expect(logs.warn).has.length(0)
          expect(messages).to.have.length(1)
          expect(messages[0]).to.equal('test,t=\\  value=1')
          expect(requests).to.equal(2)
          messages.splice(0)
          requests = 0

          // generates no lines, no requests done
          await subject.writePoints(BUCKET, new Point())
          await subject.writePoints(BUCKET, [])
          await subject.write(BUCKET, '')
          expect(requests).to.equal(0)
          expect(logs.error).has.length(0)
          expect(logs.warn).has.length(0)

          const points = [
            new Point('test').floatField('value', 1).timestamp('1'),
            new Point('test').floatField('value', 2).timestamp(2.1),
            new Point('test').floatField('value', 3).timestamp(new Date(3)),
            new Point('test')
              .floatField('value', 4)
              .timestamp(false as any as string), // server decides what to do with such values
          ]
          await subject.writePoints(BUCKET, points)
          expect(logs.error).to.length(0)
          expect(logs.warn).to.length(0)
          expect(messages).to.have.length(1)
          const lines = messages[0].split('\n')
          expect(lines).has.length(4)
          expect(messages[0]).to.equal(
            points
              .map((x) => x.toLineProtocol())
              .filter(isDefined)
              .join('\n')
          )
        }
      )
    })
    it('fails on write response status not being exactly 204', async () => {
      // required because of https://github.com/influxdata/influxdb-client-js/issues/263
      useSubject({})
      let authorization: any
      nock(clientOptions.url)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          authorization = this.req.headers.authorization
          return [200, '', {}]
        })
        .persist()
      await subject
        .write(BUCKET, 'test value=1')
        .then(() => expect.fail('failure expected'))
        .catch((e) => {
          expect(e).to.be.ok
        })
      expect(logs.error).has.length(1)
      expect(logs.error[0][0]).equals('Write to InfluxDB failed.')
      expect(logs.error[0][1]).instanceOf(HttpError)
      expect(logs.error[0][1].statusCode).equals(200)
      expect(logs.error[0][1].message).equals(
        `204 HTTP response status code expected, but 200 returned`
      )
      expect(logs.warn).deep.equals([])
      expect(authorization).equals(`Token ${clientOptions.token}`)
    })
    it('sends custom http header', async () => {
      useSubject({
        headers: {authorization: 'Token customToken'},
      })
      let authorization: any
      nock(clientOptions.url)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          authorization = this.req.headers.authorization
          return [204, '', {}]
        })
        .persist()
      await subject.writePoints(
        BUCKET,
        new Point('test').floatField('value', 1)
      )
      expect(logs.error).has.length(0)
      expect(logs.warn).has.length(0)
      expect(authorization).equals(`Token customToken`)
    })
    it('sends consistency param when specified', async () => {
      useSubject({
        consistency: 'quorum',
      })
      let uri: any
      nock(clientOptions.url)
        .post(/.*/)
        .reply(function (_uri, _requestBody) {
          uri = this.req.path
          return [204, '', {}]
        })
        .persist()
      await subject.writePoints(
        BUCKET,
        new Point('test').floatField('value', 1)
      )
      await subject.close()
      expect(logs.error).has.length(0)
      expect(logs.warn).deep.equals([])
      expect(uri).match(/.*&consistency=quorum$/)
    })
  })
})
