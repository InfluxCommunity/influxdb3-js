import {expect} from 'chai'
import {InfluxDBClient, ClientOptions, Transport} from '../../src'

describe('InfluxDB', () => {
  describe('constructor', () => {
    it('is created from configuration with url', () => {
      expect(
        (new InfluxDBClient({url: 'http://localhost:8086'}) as any)._options
      ).to.deep.equal({
        url: 'http://localhost:8086',
      })
    })
    it('is created from configuration with url and token', () => {
      expect(
        (
          new InfluxDBClient({
            url: 'https://localhost:8086?token=a',
            token: 'b',
          }) as any
        )._options
      ).to.deep.equal({
        url: 'https://localhost:8086?token=a',
        token: 'b',
      })
    })
    it('is created from configuration with url with trailing slash', () => {
      expect(
        (new InfluxDBClient({url: 'http://localhost:8086/'}) as any)._options
      ).to.deep.equal({
        url: 'http://localhost:8086',
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
    it('fails on missing url', () => {
      expect(
        () => new InfluxDBClient({} as ClientOptions as ClientOptions)
      ).to.throw('No url specified!')
    })
    it('fails on unsupported protocol', () => {
      expect(
        () =>
          new InfluxDBClient({
            url: 'ws://localhost:8086?token=b',
          })
      ).to.throw('Unsupported')
    })
    it('creates instance with transport initialized', () => {
      expect(
        new InfluxDBClient({
          url: 'http://localhost:8086',
        })
      ).has.property('transport')
      expect(
        new InfluxDBClient({
          url: 'http://localhost:8086',
          transport: null,
        } as any as ClientOptions)
      ).has.property('transport')
      expect(
        new InfluxDBClient({
          url: 'http://localhost:8086',
          transport: {} as Transport,
        } as any as ClientOptions)
      ).has.property('transport')
    })
    it('creates instance with follow-redirects', () => {
      const request = (): void => {}
      const followRedirects = {
        https: {request},
      }
      expect(
        new InfluxDBClient({
          url: 'https://localhost:8086',
          transportOptions: {
            'follow-redirects': followRedirects,
          },
        })
      )
        .has.property('transport')
        .has.property('requestApi')
        .is.equal(request)
    })
  })
})
