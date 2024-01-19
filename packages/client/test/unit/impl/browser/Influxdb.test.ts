import {expect} from 'chai'
import sinon from 'sinon'
import {InfluxDBClient, DEFAULT_ConnectionOptions} from '../../../../src'

describe('InfluxDB', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('constructor with connection string', () => {
    it('is created with relative URL with token (#213)', () => {
      // should be tested only with FetchTransport
      expect(
        (new InfluxDBClient('/influx?token=my-token') as any)._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: '/influx',
        token: 'my-token',
      })
    })
  })
})
