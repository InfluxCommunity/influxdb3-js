import InfluxDBClient from '../../src/InfluxDBClient'
import {MockService, TestServer} from '../TestServer'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('query api tests', () => {
  let server: TestServer
  before('start server', async () => {
    console.log('starting server')
    server = new TestServer()
    await server.start()
  })
  after('stop server', async () => {
    await server.shutdown()
  })
  it('sends a query', async () => {
    const client: InfluxDBClient = new InfluxDBClient({
      host: `http://localhost:${server.port}`,
      token: 'TEST_TOKEN',
      database: 'CI_TEST',
    })
    const query = `SELECT * FROM wumpus`
    const queryType = 'sql'
    const data = client.query(query, 'CI_TEST', queryType)
    try {
      const row: IteratorResult<Record<string, any>, void> = await data.next()
      console.log(`CLIENT DEBUG DEBUG row ${JSON.stringify(row)}`)
    } catch (e: any) {
      console.error(`CLIENT DEBUG Caught error ${e}`)
      console.error(e.stack)
    }
    console.log(`DEBUG MockService ${JSON.stringify(MockService.callCount)}`)
    // const queryResult = await data.next()
    //console.log(`DEBUG queryResult ${queryResult}`)
    const doGetMap = MockService.callMeta.get(MockService.genCallId('doGet', 1))
    if (doGetMap != null) {
      console.log(
        `DEBUG MockService.getCallMeta {doGet1} ${Array.from(doGetMap.keys())}`
      )
      for (const key of doGetMap.keys()) {
        console.log(
          `  DEBUG ${key}: ${MockService.getCallMeta(MockService.genCallId('doGet', 1), key)}`
        )
      }
    }
    console.log(
      `DEBUG MockService.getCallTicket { doGet1 } ${JSON.stringify(MockService.getCallTicketDecoded(MockService.genCallId('doGet', 1)))}`
    )
    await sleep(3000)
  }).timeout(600_000)
  it('basic query', async () => {
    const client: InfluxDBClient = new InfluxDBClient({
      host: `http://localhost:${server.port}`,
      token: `TEST_TOKEN`,
      database: 'CI_TEST',
    })
    const query = `SELECT * FROM wumpus`
    const data = client.query(query, 'CI_TEST')
    try {
      const row: IteratorResult<Record<string, any>, void> = await data.next()
      console.log(`DEBUG row ${JSON.stringify(row)}`)
    } catch (e: any) {
      console.error(`Caught error ${e}`)
      console.error(e.stack)
    }
  })
})
