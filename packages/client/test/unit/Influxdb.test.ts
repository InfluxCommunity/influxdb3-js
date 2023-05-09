import {expect} from 'chai'
import {InfluxDB, ClientOptions, Transport} from '../../src'

describe('InfluxDB', () => {
  describe('constructor', () => {
    it('is created from string url', () => {
      expect(
        (new InfluxDB('http://localhost:8086') as any)._options
      ).to.deep.equal({
        url: 'http://localhost:8086',
      })
    })
    it('is created from configuration with url', () => {
      expect(
        (new InfluxDB({host: 'http://localhost:8086'}) as any)._options
      ).to.deep.equal({
        url: 'http://localhost:8086',
      })
    })
    it('is created from configuration with url and token', () => {
      expect(
        (
          new InfluxDB({
            host: 'https://localhost:8086?token=a',
            token: 'b',
          }) as any
        )._options
      ).to.deep.equal({
        url: 'https://localhost:8086?token=a',
        token: 'b',
      })
    })
    it('is created from string url with trailing slash', () => {
      expect(
        (new InfluxDB('http://localhost:8086/') as any)._options
      ).to.deep.equal({
        url: 'http://localhost:8086',
      })
    })
    it('is created from configuration with url with trailing slash', () => {
      expect(
        (new InfluxDB({host: 'http://localhost:8086/'}) as any)._options
      ).to.deep.equal({
        url: 'http://localhost:8086',
      })
    })
    it('fails on null arg', () => {
      expect(() => new InfluxDB(null as unknown as ClientOptions)).to.throw(
        'No url or configuration specified!'
      )
    })
    it('fails on undefined arg', () => {
      expect(
        () => new InfluxDB(undefined as unknown as ClientOptions)
      ).to.throw('No url or configuration specified!')
    })
    it('fails on missing url', () => {
      expect(() => new InfluxDB({} as ClientOptions as ClientOptions)).to.throw(
        'No url specified!'
      )
    })
    it('fails on unsupported protocol', () => {
      expect(
        () =>
          new InfluxDB({
            host: 'ws://localhost:8086?token=b',
          })
      ).to.throw('Unsupported')
    })
    it('creates instance with transport initialized', () => {
      expect(
        new InfluxDB({
          host: 'http://localhost:8086',
        })
      ).has.property('transport')
      expect(
        new InfluxDB({
          url: 'http://localhost:8086',
          transport: null,
        } as any as ClientOptions)
      ).has.property('transport')
      expect(
        new InfluxDB({
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
        new InfluxDB({
          host: 'https://localhost:8086',
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
