// @ts-nocheck
import {unstable_dev} from 'wrangler'
import {expect} from 'chai'

describe('Worker', () => {
  let worker

  before(async () => {
    // An Envoy proxy must be run for this test to works
    // Replacing your wrangler.json file TESTING_INFLUXDB_URL property with the url point to your Envoy server
    worker = await unstable_dev('./test/integration/cloudflare/index.ts', {
      experimental: {disableExperimentalWarning: true},
      local: true,
      logLevel: 'info', // change this value to debug when you want to check the error from cloudflare
      compatibilityFlags: ['nodejs_compat'],
      bundle: true,
    })
  })

  it('write to influxdb in cloudflare worker', async () => {
    const response = await worker.fetch()
    expect(response.status).equal(200)
    const point = await response.json()
    expect(point).not.null
  }).timeout(5000)

  after(async () => {
    await worker.stop()
  })
})
