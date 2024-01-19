import sinon from 'sinon'
import {expect} from 'chai'
import {ClientOptions, fromConnectionString} from '../../src'

describe('ClientOptions', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('constructor with connection string', () => {
    it('is created with relative URL with token (#213)', () => {
      expect(
        fromConnectionString('/influx?token=my-token') as ClientOptions
      ).to.deep.equal({
        host: '/influx',
        token: 'my-token',
      })
    })
    it('is created with relative URL with token + whitespace around (#213)', () => {
      expect(
        fromConnectionString(' /influx?token=my-token ') as ClientOptions
      ).to.deep.equal({
        host: '/influx',
        token: 'my-token',
      })
    })
  })
})
