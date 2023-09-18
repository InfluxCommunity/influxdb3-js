import {expect} from 'chai'
import sinon from 'sinon'
import {InfluxDBClient, ClientOptions, Transport} from '../../src'
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
    client.queryPoints(query).next()

    expect(queryPointsStub.calledOnceWith(query, database, 'sql')).to.be.true
    queryPointsStub.resetHistory()

    client.queryPoints(query, 'another').next()
    expect(queryPointsStub.calledOnceWith(query, 'another', 'sql')).to.be.true
  })

  it('throws when no database provided', async () => {
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
    })

    expect(() => client.query('query')).to.throw(`\
Please specify the 'database' as a method parameter or use default configuration \
at 'ClientOptions.database'
`)
    await rejects(client.write('data'))
  })

  describe('constructor', () => {
    it('is created from configuration with host', () => {
      expect(
        (new InfluxDBClient({host: 'http://localhost:8086'}) as any)._options
      ).to.deep.equal({
        host: 'http://localhost:8086',
      })
    })
    it('is created from configuration with host and token', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086?token=a',
            token: 'b',
          }) as any
        )._options
      ).to.deep.equal({
        host: 'https://localhost:8086?token=a',
        token: 'b',
      })
    })
    it('is created from configuration with host with trailing slash', () => {
      expect(
        (new InfluxDBClient({host: 'http://localhost:8086/'}) as any)._options
      ).to.deep.equal({
        host: 'http://localhost:8086',
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
          })
      ).to.throw('Unsupported')
    })
    it('creates instance with transport initialized', () => {
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
        })
      )
        .property('_writeApi')
        .has.property('_transport')
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          transport: null,
        } as any as ClientOptions)
      )
        .property('_writeApi')
        .has.property('_transport')
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
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
})
