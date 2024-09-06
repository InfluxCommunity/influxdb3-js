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
  host: 'http://fake:8086',
  token: 'a',
}
const DATABASE = 'database'
const PRECISION: WritePrecision = 's'

const WRITE_PATH_NS = `/api/v2/write?bucket=${DATABASE}&precision=ns`

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
        .write('test value=1', DATABASE)
        .then(() => expect.fail('failure expected'))
        .catch((e) => {
          expect(logs.error).length.greaterThan(0)
          expect(e).to.be.ok
        })
    })
    it('fails on write if it is closed already', async () => {
      await subject.close()

      await rejects(subject.write('text value=1', DATABASE))
      await rejects(subject.write(['text value=1', 'text value=2'], DATABASE))
      await rejects(
        subject.write(
          Point.measurement('test').setFloatField('value', 1),
          DATABASE
        )
      )
      await rejects(
        subject.write(
          [Point.measurement('test').setFloatField('value', 1)],
          DATABASE
        )
      )
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
    const defaultTags = {blah: 'foo'}

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
                  defaultTags,
                }
              : {
                  defaultTags,
                }
          )
          let requests = 0
          let failNextRequest = false
          const messages: string[] = []
          nock(clientOptions.host)
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
          const point = Point.measurement('test')
            .setTag('t', ' ')
            .setFloatField('value', 1)
            .setTimestamp('')

          failNextRequest = true
          await subject
            .write(point, DATABASE)
            .then(() => expect.fail('failure expected'))
            .catch((e) => {
              expect(e).to.be.ok
            })
          expect(logs.error).has.length(1)
          expect(logs.warn).has.length(0)
          logs.reset()

          await subject.write(point, DATABASE)
          expect(logs.error).has.length(0)
          expect(logs.warn).has.length(0)
          expect(messages).to.have.length(1)
          expect(messages[0]).to.equal('test,blah=foo,t=\\  value=1')
          expect(requests).to.equal(2)
          messages.splice(0)
          requests = 0

          // generates no lines, no requests done
          await subject.write(Point.measurement('m'), DATABASE)
          await subject.write([], DATABASE)
          await subject.write('', DATABASE)
          expect(requests).to.equal(0)
          expect(logs.error).has.length(0)
          expect(logs.warn).has.length(0)

          const points = [
            Point.measurement('test')
              .setFloatField('value', 1)
              .setTimestamp('1'),
            Point.measurement('test')
              .setFloatField('value', 2)
              .setTimestamp(2.1),
            Point.measurement('test')
              .setFloatField('value', 3)
              .setTimestamp(new Date(3)),
            Point.measurement('test')
              .setFloatField('value', 4)
              .setTimestamp(false as any as string), // server decides what to do with such values
          ]
          await subject.write(points, DATABASE)
          expect(logs.error).to.length(0)
          expect(logs.warn).to.length(0)
          expect(messages).to.have.length(1)
          const lines = messages[0].split('\n')
          expect(lines).has.length(4)
          expect(messages[0]).to.equal(
            points
              .map((x) => x.toLineProtocol(undefined, defaultTags))
              .filter(isDefined)
              .join('\n')
          )
        }
      )
    })
    it('fails on write response status not being 2xx', async () => {
      useSubject({})
      let authorization: any
      nock(clientOptions.host)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          authorization = this.req.headers.authorization
          return [100, '', {}]
        })
        .persist()
      await subject
        .write('test value=1', DATABASE)
        .then(() => expect.fail('failure expected'))
        .catch((e) => {
          expect(e).to.be.ok
        })
      expect(logs.error).has.length(1)
      expect(logs.error[0][0]).equals('Write to InfluxDB failed.')
      expect(logs.error[0][1]).instanceOf(HttpError)
      expect(logs.error[0][1].statusCode).equals(100)
      expect(logs.error[0][1].message).equals(
        `2xx HTTP response status code expected, but 100 returned`
      )
      expect(logs.warn).deep.equals([])
      expect(authorization).equals(`Token ${clientOptions.token}`)
    })
    it('support 201 Created', async () => {
      useSubject({})
      let authorization: any
      nock(clientOptions.host)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          authorization = this.req.headers.authorization
          return [201, '', {}]
        })
        .persist()
      await subject.write('test value=1', DATABASE)
      expect(logs.error).to.length(0)
      expect(logs.warn).to.length(0)
      expect(authorization).equals(`Token a`)
    })
    it('sends custom http header', async () => {
      useSubject({
        headers: {
          authorization: 'Token customToken',
          'channel-lane': 'reserved',
        },
      })
      let authorization: any
      let channelLane = ''
      nock(clientOptions.host)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          authorization = this.req.headers.authorization
          channelLane = this.req.headers['channel-lane']
          return [204, '', {}]
        })
        .persist()
      await subject.write(
        Point.measurement('test').setFloatField('value', 1),
        DATABASE
      )
      expect(logs.error).has.length(0)
      expect(logs.warn).has.length(0)
      expect(authorization).equals(`Token customToken`)
      expect(channelLane).equals('reserved')
    })
    it('sends custom header from client config', async () => {
      subject = new InfluxDBClient({
        ...clientOptions,
        headers: {
          universal: 'substance',
        },
        writeOptions: {
          headers: {
            particular: 'attribute',
          },
        },
      })
      let universal: any
      let particular: any
      nock(clientOptions.host)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          universal = this.req.headers.universal
          particular = this.req.headers.particular
          return [204, '', {}]
        })
        .persist()
      await subject.write(
        Point.measurement('test').setFloatField('value', 1),
        DATABASE
      )
      expect(logs.error).has.length(0)
      expect(logs.warn).has.length(0)
      expect(universal).equals('substance')
      expect(particular).equals('attribute')
    })
  })
  describe('propagate error headers', async () => {
    it('propagates retry header on 429', async () => {
      const client: InfluxDBClient = new InfluxDBClient({
        ...clientOptions,
      })
      nock(clientOptions.host)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          return [
            429,
            '{ message: "see status code"}',
            {'retry-after': '42', 'content-type': 'application/json'},
          ]
        })
        .persist()
      try {
        await client.write(
          Point.measurement('test').setFloatField('value', 1),
          DATABASE
        )
      } catch (error: any) {
        expect(error.contentType).equals('application/json')
        expect(error.statusCode).equals(429)
        expect(error.headers).is.not.empty
        expect(error.headers['retry-after']).equals('42')
        if (!(error instanceof HttpError)) {
          expect.fail(`caught error which is not HttpError: ${error}`)
        }
      }
    })
    it('propagates retry on 503', async () => {
      const client: InfluxDBClient = new InfluxDBClient({
        ...clientOptions,
      })
      const retryDate = new Date(new Date().valueOf() + 600000)
      nock(clientOptions.host)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          return [
            503,
            '{ message: "see status code"}',
            {
              'retry-after': retryDate.toISOString(),
              'content-type': 'application/json',
            },
          ]
        })
        .persist()
      try {
        await client.write(
          Point.measurement('test').setFloatField('value', 1),
          DATABASE
        )
      } catch (error: any) {
        expect(error.contentType).equals('application/json')
        expect(error.statusCode).equals(503)
        expect(error.headers).is.not.empty
        expect(retryDate.toISOString()).equals(error.headers['retry-after'])
        if (!(error instanceof HttpError)) {
          expect.fail(`caught error which is not HttpError: ${error}`)
        }
      }
    })
  })
})
