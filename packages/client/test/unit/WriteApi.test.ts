import {expect} from 'chai'
import nock from 'nock' // WARN: nock must be imported before NodeHttpTransport, since it modifies node's http
import {
  ClientOptions,
  HttpError,
  WriteOptions,
  Point,
  WriteApi,
  InfluxDB,
  WritePrecisionType,
  DEFAULT_WriteOptions,
  PointSettings,
} from '../../src'
import {collectLogging, CollectedLogs, unhandledRejections} from '../util'
import {waitForCondition} from './util/waitForCondition'
import zlib from 'zlib'
import {rejects} from 'assert'

const clientOptions: ClientOptions = {
  url: 'http://fake:8086',
  token: 'a',
}
const ORG = 'my-org'
const BUCKET = 'bucket'
const PRECISION: WritePrecisionType = 's'

const WRITE_PATH_NS = `/api/v2/write?org=${ORG}&bucket=${BUCKET}&precision=ns`

function createApi(
  bucket: string,
  precision: WritePrecisionType,
  options: Partial<WriteOptions>
): WriteApi {
  return new InfluxDB({
    ...clientOptions,
    ...{writeOptions: options},
  }).getWriteApi(bucket, precision)
}

interface WriteListeners {
  successLineCount: number
  failedLineCount: number
  writeFailed(error: Error, lines: string[]): void
  writeSuccess(lines: string[]): void
}
function createWriteCounters(): WriteListeners {
  const retVal = {
    successLineCount: 0,
    failedLineCount: 0,
    writeFailed(_error: Error, lines: string[]): void {
      retVal.failedLineCount += lines.length
    },
    writeSuccess(lines: string[]): void {
      retVal.successLineCount += lines.length
    },
  }
  return retVal
}

describe('WriteApi', () => {
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
    let subject: WriteApi
    let logs: CollectedLogs
    beforeEach(() => {
      subject = createApi(BUCKET, PRECISION, {
        retryJitter: 0,
      })
      // logs = collectLogging.decorate()
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
    it.skip('fails on close without server connection', async () => {
      subject.writeRecord('test value=1')
      subject.writeRecords(['test value=2', 'test value=3'])
      await subject
        .close()
        .then(() => expect.fail('failure expected'))
        .catch((e) => {
          expect(logs.error).length.greaterThan(0)
          expect(e).to.be.ok
        })
    })
    it('fails on write if it is closed already', async () => {
      await subject.close()

      await rejects(subject.writeRecord('text value=1'))
      await rejects(subject.writeRecords(['text value=1', 'text value=2']))
      await rejects(
        subject.writePoint(new Point('test').floatField('value', 1))
      )
      await rejects(
        subject.writePoints([new Point('test').floatField('value', 1)])
      )
    })
  })
  describe('configuration', () => {
    let subject: WriteApi
    function useSubject(writeOptions: Partial<WriteOptions>): void {
      subject = new InfluxDB({
        ...clientOptions,
      }).getWriteApi(BUCKET, PRECISION, writeOptions)
    }
    afterEach(async () => {
      await subject.close()
      collectLogging.after()
    })
    it('implementation uses expected defaults', () => {
      useSubject({})
      const writeOptions = (subject as any).writeOptions as WriteOptions
      expect(writeOptions.writeFailed).equals(DEFAULT_WriteOptions.writeFailed)
      expect(writeOptions.writeSuccess).equals(
        DEFAULT_WriteOptions.writeSuccess
      )
      expect(writeOptions.writeSuccess).to.not.throw()
      expect(writeOptions.writeFailed).to.not.throw()
      expect(writeOptions.randomRetry).equals(true)
    })
  })
  describe('convert point time to line protocol', () => {
    const writeAPI = createApi(BUCKET, 'ms', {
      retryJitter: 0,
    }) as PointSettings
    it('converts empty string to no timestamp', () => {
      const p = new Point('a').floatField('b', 1).timestamp('')
      expect(p.toLineProtocol(writeAPI)).equals('a b=1')
    })
    it('converts number to timestamp', () => {
      const p = new Point('a').floatField('b', 1).timestamp(1.2)
      expect(p.toLineProtocol(writeAPI)).equals('a b=1 1')
    })
    it('converts Date to timestamp', () => {
      const d = new Date()
      const p = new Point('a').floatField('b', 1).timestamp(d)
      expect(p.toLineProtocol(writeAPI)).equals(`a b=1 ${d.getTime()}`)
    })
    it('converts undefined to local timestamp', () => {
      const p = new Point('a').floatField('b', 1)
      expect(p.toLineProtocol(writeAPI)).satisfies((x: string) => {
        return x.startsWith('a b=1')
      }, `does not start with 'a b=1'`)
      expect(p.toLineProtocol(writeAPI)).satisfies((x: string) => {
        return Date.now() - Number.parseInt(x.substring('a b=1 '.length)) < 1000
      })
    })
  })
  describe('convert default tags to line protocol', () => {
    it('works with tags OOTB', () => {
      const writeAPI = createApi(BUCKET, 'ms', {
        retryJitter: 0,
      })
      const p = new Point('a').floatField('b', 1).timestamp('')
      expect(p.toLineProtocol(writeAPI)).equals('a b=1')
    })
    it('setups tags using useDefaultTags ', () => {
      const writeAPI = createApi(BUCKET, 'ms', {
        retryJitter: 0,
      })
      const p = new Point('a').floatField('b', 1).timestamp('')
      writeAPI.useDefaultTags({
        x: 'y z',
        'a b': 'c',
      })
      expect(p.toLineProtocol(writeAPI)).equals('a,a\\ b=c,x=y\\ z b=1')
    })
    it('setups tags from configuration', () => {
      const writeAPI = createApi(BUCKET, 'ms', {
        retryJitter: 0,
        defaultTags: {
          x: 'y z',
          'a b': 'c',
        },
      })
      const p = new Point('a').floatField('b', 1).timestamp('')
      expect(p.toLineProtocol(writeAPI)).equals('a,a\\ b=c,x=y\\ z b=1')
    })
  })
  describe('usage of server API', () => {
    let subject: WriteApi
    let logs: CollectedLogs
    function useSubject(writeOptions: Partial<WriteOptions>): void {
      subject = createApi(BUCKET, 'ns', {
        retryJitter: 0,
        defaultTags: {xtra: '1'},
        ...writeOptions,
      })
    }
    beforeEach(() => {
      // logs = collectLogging.decorate()
      logs = collectLogging.replace()
    })
    afterEach(async () => {
      subject.close()
      collectLogging.after()
    })
    it.skip('flushes the records without errors', async () => {
      const writeCounters = createWriteCounters()
      useSubject({
        flushInterval: 5,
        randomRetry: false,
        batchSize: 10,
        writeSuccess: writeCounters.writeSuccess,
      })
      let requests = 0
      const messages: string[] = []
      nock(clientOptions.url)
        .post(WRITE_PATH_NS)
        .reply((_uri, _requestBody) => {
          requests++
          if (requests % 2) {
            return [429, '', {'retry-after': '1'}]
          } else {
            messages.push(_requestBody.toString())
            return [204, '', {'retry-after': '1'}]
          }
        })
        .persist()
      subject.writePoint(
        new Point('test').tag('t', ' ').floatField('value', 1).timestamp('')
      )
      await waitForCondition(() => writeCounters.successLineCount == 1)
      expect(logs.error).has.length(0)
      expect(logs.warn).has.length(1) // request was retried once
      subject.writePoint(new Point()) // ignored, since it generates no line
      subject.writePoints([
        new Point('test'), // will be ignored + warning
        new Point('test').floatField('value', 2),
        new Point('test').floatField('value', 3),
        new Point('test').floatField('value', 4).timestamp('1'),
        new Point('test').floatField('value', 5).timestamp(2.1),
        new Point('test').floatField('value', 6).timestamp(new Date(3)),
        new Point('test')
          .floatField('value', 7)
          .timestamp(false as any as string), // server decides what to do with such values
      ])
      await waitForCondition(() => writeCounters.successLineCount == 7)
      expect(logs.error).to.length(0)
      expect(logs.warn).to.length(2)
      expect(messages).to.have.length(2)
      expect(messages[0]).to.equal('test,t=\\ ,xtra=1 value=1')
      const lines = messages[1].split('\n')
      expect(lines).has.length(6)
      expect(lines[0]).to.satisfy((line: string) =>
        line.startsWith('test,xtra=1 value=2')
      )
      expect(lines[0].substring(lines[0].lastIndexOf(' ') + 1)).to.have.length(
        String(Date.now()).length + 6 // nanosecond precision
      )
      expect(lines[1]).to.satisfy((line: string) =>
        line.startsWith('test,xtra=1 value=3')
      )
      expect(lines[0].substring(lines[0].lastIndexOf(' ') + 1)).to.have.length(
        String(Date.now()).length + 6 // nanosecond precision
      )
      expect(lines[2]).to.be.equal('test,xtra=1 value=4 1')
      expect(lines[3]).to.be.equal('test,xtra=1 value=5 2')
      expect(lines[4]).to.be.equal('test,xtra=1 value=6 3000000')
      expect(lines[5]).to.be.equal('test,xtra=1 value=7 false')
    })
    it.skip('flushes gzipped line protocol', async () => {
      const writeCounters = createWriteCounters()
      useSubject({
        flushInterval: 5,
        randomRetry: false,
        batchSize: 10,
        writeSuccess: writeCounters.writeSuccess,
        gzipThreshold: 0,
      })
      let requests = 0
      const messages: string[] = []
      nock(clientOptions.url)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          requests++
          if (requests % 2) {
            return [429, '', {'retry-after': '1'}]
          } else {
            if (this.req.headers['content-encoding'] == 'gzip') {
              const plain = zlib.gunzipSync(
                Buffer.from(_requestBody as string, 'hex')
              )
              messages.push(plain.toString())
            }
            return [204, '', {'retry-after': '1'}]
          }
        })
        .persist()
      subject.writePoint(
        new Point('test').tag('t', ' ').floatField('value', 1).timestamp('')
      )
      await waitForCondition(() => writeCounters.successLineCount == 1)
      expect(logs.error).has.length(0)
      expect(logs.warn).has.length(1) // request was retried once
      subject.writePoint(new Point()) // ignored, since it generates no line
      subject.writePoints([
        new Point('test'), // will be ignored + warning
        new Point('test').floatField('value', 2),
        new Point('test').floatField('value', 3),
        new Point('test').floatField('value', 4).timestamp('1'),
        new Point('test').floatField('value', 5).timestamp(2.1),
        new Point('test').floatField('value', 6).timestamp(new Date(3)),
        new Point('test')
          .floatField('value', 7)
          .timestamp(false as any as string), // server decides what to do with such values
      ])
      await waitForCondition(() => writeCounters.successLineCount == 7)
      expect(logs.error).to.length(0)
      expect(logs.warn).to.length(2)
      expect(messages).to.have.length(2)
      expect(messages[0]).to.equal('test,t=\\ ,xtra=1 value=1')
      const lines = messages[1].split('\n')
      expect(lines).has.length(6)
      expect(lines[0]).to.satisfy((line: string) =>
        line.startsWith('test,xtra=1 value=2')
      )
      expect(lines[0].substring(lines[0].lastIndexOf(' ') + 1)).to.have.length(
        String(Date.now()).length + 6 // nanosecond precision
      )
      expect(lines[1]).to.satisfy((line: string) =>
        line.startsWith('test,xtra=1 value=3')
      )
      expect(lines[0].substring(lines[0].lastIndexOf(' ') + 1)).to.have.length(
        String(Date.now()).length + 6 // nanosecond precision
      )
      expect(lines[2]).to.be.equal('test,xtra=1 value=4 1')
      expect(lines[3]).to.be.equal('test,xtra=1 value=5 2')
      expect(lines[4]).to.be.equal('test,xtra=1 value=6 3000000')
      expect(lines[5]).to.be.equal('test,xtra=1 value=7 false')
    })
    it.skip('fails on write response status not being exactly 204', async () => {
      const writeCounters = createWriteCounters()
      // required because of https://github.com/influxdata/influxdb-client-js/issues/263
      useSubject({
        flushInterval: 2000, // do not flush automatically in the test
        batchSize: 10,
        maxBatchBytes: 15,
        writeFailed: writeCounters.writeFailed,
      })
      let authorization: any
      nock(clientOptions.url)
        .post(WRITE_PATH_NS)
        .reply(function (_uri, _requestBody) {
          authorization = this.req.headers.authorization
          return [200, '', {}]
        })
        .persist()
      subject.writeRecord('test value=1')
      // flushes the previous record by writing a next one
      // that would exceed 15 maxBatchBytes
      subject.writeRecord('test value=2')
      await waitForCondition(() => writeCounters.failedLineCount == 1)
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
    it.skip('sends custom http header', async () => {
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
      subject.writePoint(new Point('test').floatField('value', 1))
      await subject.close()
      expect(logs.error).has.length(0)
      expect(logs.warn).deep.equals([])
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
      await subject.writePoint(new Point('test').floatField('value', 1))
      await subject.close()
      expect(logs.error).has.length(0)
      expect(logs.warn).deep.equals([])
      expect(uri).match(/.*&consistency=quorum$/)
    })
    it('allows to overwrite httpPath', async () => {
      useSubject({})
      expect(subject.path).match(/api\/v2\/write\?.*$/)
      const customPath = '/custom/path?whathever=itis'
      subject.path = customPath
      let uri: any
      nock(clientOptions.url)
        .post(/.*/)
        .reply(function (_uri, _requestBody) {
          uri = this.req.path
          return [204, '', {}]
        })
        .persist()
      await subject.writePoint(new Point('test').floatField('value', 1))
      await subject.close()
      expect(logs.error).has.length(0)
      expect(logs.warn).deep.equals([])
      expect(uri).equals(customPath)
    })
    it('swallows hinted handoff queue not empty', async () => {
      useSubject({
        consistency: 'quorum',
      })
      nock(clientOptions.url)
        .post(/.*/)
        .reply(function (_uri, _requestBody) {
          return [
            500,
            '{"error": "write: hinted handoff queue not empty"}',
            {'content-type': 'application/json'},
          ]
        })
        .persist()
      await subject.writePoint(new Point('test').floatField('value', 1))
      await subject.close()
      expect(logs.error).has.length(0)
      expect(logs.warn).deep.equals([
        [
          'Write to InfluxDB returns: write: hinted handoff queue not empty',
          undefined,
        ],
      ])
    })
  })
})
