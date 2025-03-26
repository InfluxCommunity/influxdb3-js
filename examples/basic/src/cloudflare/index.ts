// An Envoy proxy must be run for this test to works
// Replacing your wrangler.json file TESTING_INFLUXDB_URL property with the url point to your Envoy server

import {unstable_dev} from 'wrangler'

async function foo() {
  const worker = await unstable_dev('./src/cloudflare/worker.ts', {
    experimental: {disableExperimentalWarning: true},
    local: true,
    logLevel: 'info', // change this value to debug when you want to check the error from cloudflare
    compatibilityFlags: ['nodejs_compat'],
    bundle: true,
  })

  const response = await worker.fetch()
  const point = await response.json()
  console.log(point)

  await worker.stop()
}

foo()
