import {expect} from 'chai'
import sinon from 'sinon'
import {
  InfluxDBClient,
  ClientOptions,
  Transport,
  WriteOptions,
  WritePrecision,
  DEFAULT_ConnectionOptions,
} from '../../src'
import type WriteApi from '../../src/WriteApi'
import type QueryApi from '../../src/QueryApi'
import {rejects} from 'assert'

describe('InfluxDB', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('uses options database', () => {
    const database = 'my-db'
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
      token: 'my-token',
      database,
    })
    const writeApi: WriteApi = (client as any)._writeApi
    const queryApi: QueryApi = (client as any)._queryApi
    const writeStub = sinon.stub(writeApi, 'doWrite')
    const queryStub = sinon.stub(queryApi, 'query')
    const queryPointsStub = sinon.stub(queryApi, 'queryPoints')

    const lines = ['lpdata']

    client.write(lines)

    expect(writeStub.calledWith(lines, database)).to.be.true
    writeStub.resetHistory()

    client.write(lines, 'another')
    expect(writeStub.calledOnceWith(lines, 'another')).to.be.true

    const query = 'select *'
    client.query(query)

    expect(queryStub.calledOnceWith(query, database, 'sql')).to.be.true
    queryStub.resetHistory()

    client.query(query, 'another')
    expect(queryStub.calledOnceWith(query, 'another', 'sql')).to.be.true

    // queryPoints
    client.queryPoints(query)

    expect(queryPointsStub.calledOnceWith(query, database, 'sql')).to.be.true
    queryPointsStub.resetHistory()

    client.queryPoints(query, 'another')
    expect(queryPointsStub.calledOnceWith(query, 'another', 'sql')).to.be.true
  })

  it('throws when no database provided', async () => {
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
      token: 'my-token',
    })

    expect(() => client.query('query')).to.throw(`\
Please specify the 'database' as a method parameter or use default configuration \
at 'ClientOptions.database'
`)
    await rejects(client.write('data'))
  })

  it('throws when no database provided queryPoints', async () => {
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
      token: 'my-token',
    })

    expect(() => client.queryPoints('query')).to.throw(`\
Please specify the 'database' as a method parameter or use default configuration \
at 'ClientOptions.database'
`)
    await rejects(client.write('data'))
  })

  describe('constructor with ClientOptions', () => {
    it('is created with host and token', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086',
            token: 'my-token',
          }) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with host with trailing slash and token', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086/',
            token: 'my-token',
          }) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('fails on null arg', () => {
      expect(
        () => new InfluxDBClient(null as unknown as ClientOptions)
      ).to.throw('No configuration specified!')
    })
    it('fails on undefined arg', () => {
      expect(
        () => new InfluxDBClient(undefined as unknown as ClientOptions)
      ).to.throw('No configuration specified!')
    })
    it('fails on missing host', () => {
      expect(
        () => new InfluxDBClient({} as ClientOptions as ClientOptions)
      ).to.throw('No host specified!')
    })
    it('fails on unsupported protocol', () => {
      expect(
        () =>
          new InfluxDBClient({
            host: 'ws://localhost:8086?token=b',
            token: 'my-token',
          })
      ).to.throw('Unsupported')
    })
    it('fails on missing token', () => {
      expect(
        () =>
          new InfluxDBClient({
            host: 'http://localhost:8086',
          })
      ).to.throw('No token specified!')
    })
    it('creates instance with transport initialized', () => {
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          token: 'my-token',
        })
      )
        .property('_writeApi')
        .has.property('_transport')
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          token: 'my-token',
          transport: null,
        } as any as ClientOptions)
      )
        .property('_writeApi')
        .has.property('_transport')
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          token: 'my-token',
          transport: {} as Transport,
        } as any as ClientOptions)
      )
        .property('_writeApi')
        .has.property('_transport')
    })
    it('creates instance with follow-redirects', () => {
      const request = (): void => {}
      const followRedirects = {
        https: {request},
      }
      expect(
        new InfluxDBClient({
          host: 'https://localhost:8086',
          token: 'my-token',
          transportOptions: {
            'follow-redirects': followRedirects,
          },
        })
      )
        .property('_writeApi')
        .has.property('_transport')
        .has.property('_requestApi')
        .is.equal(request)
    })
  })

  describe('constructor with connection string', () => {
    it('fails on unsupported protocol', () => {
      expect(
        () => new InfluxDBClient('ws://localhost:8086?token=my-token')
      ).to.throw('Unsupported')
    })
    it('fails on missing token', () => {
      expect(() => new InfluxDBClient('https://localhost:8086')).to.throw(
        'No token specified!'
      )
    })
    it('is created with token', () => {
      expect(
        (new InfluxDBClient('https://localhost:8086?token=my-token') as any)
          ._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with token + has whitespaces around (#194)', () => {
      expect(
        (new InfluxDBClient(' https://localhost:8086?token=my-token ') as any)
          ._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with relative URL with token (#213)', () => {
      expect(
        (new InfluxDBClient(' /influx?token=my-token') as any)._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: '/influx',
        token: 'my-token',
      })
    })
    it('is created with token and database', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&database=my-database'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        database: 'my-database',
      })
    })
    it('is created with token and timeout', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&timeout=75'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        timeout: 75,
      })
    })
    it('is created with precision', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&precision=us'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
        } as WriteOptions,
      })
    })
    it('is created with gzip threshold', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&gzipThreshold=128'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          gzipThreshold: 128,
        } as WriteOptions,
      })
    })
    it('is created with precision and gzip threshold', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&precision=us&gzipThreshold=128'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
          gzipThreshold: 128,
        } as WriteOptions,
      })
    })
  })

  describe('constructor from environment variables', () => {
    const clear = () => {
      delete process.env['INFLUX_HOST']
      delete process.env['INFLUX_TOKEN']
      delete process.env['INFLUX_DATABASE']
      delete process.env['INFLUX_TIMEOUT']
      delete process.env['INFLUX_PRECISION']
      delete process.env['INFLUX_GZIP_THRESHOLD']
    }
    it('fails on missing host', () => {
      clear()
      expect(() => new InfluxDBClient()).to.throw(
        'INFLUX_HOST variable not set!'
      )
    })
    it('fails on missing token', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      expect(() => new InfluxDBClient()).to.throw(
        'INFLUX_TOKEN variable not set!'
      )
    })
    it('is created with host and token', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with host and token + has whitespaces around (#194)', () => {
      clear()
      process.env['INFLUX_HOST'] = ' https://localhost:8086 '
      process.env['INFLUX_TOKEN'] = ' my-token '
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with host, token and database', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_DATABASE'] = 'my-database'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        database: 'my-database',
      })
    })
    it('is created with host, token and timeout', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_TIMEOUT'] = '75'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        timeout: 75,
      })
    })
    it('is created with host, token and precision', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_PRECISION'] = 'us'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
        } as WriteOptions,
      })
    })
    it('is created with host, token and gzip threshold', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_GZIP_THRESHOLD'] = '128'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          gzipThreshold: 128,
        } as WriteOptions,
      })
    })
    it('is created with host, token, precision and gzip threshold', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_PRECISION'] = 'us'
      process.env['INFLUX_GZIP_THRESHOLD'] = '128'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
          gzipThreshold: 128,
        } as WriteOptions,
      })
    })
  })
})
