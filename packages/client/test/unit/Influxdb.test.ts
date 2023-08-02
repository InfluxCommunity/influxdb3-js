import {expect} from 'chai'
import {InfluxDBClient, ClientOptions, Transport} from '../../src'

describe('InfluxDB', () => {
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
        .has.property('requestApi')
        .is.equal(request)
    })
  })
})
