import {BaseFlightService, MockService, TestServer} from '../TestServer'
import * as grpc from '@grpc/grpc-js'
import * as flt from '../../src/generated/flight/Flight'
import {
  Int32,
  MessageReader,
  Table,
  tableToIPC,
  Utf8,
  vectorFromArray,
} from 'apache-arrow'
import {Message} from 'apache-arrow/ipc/metadata/message'
import {assert, expect} from 'chai'
import {
  DEFAULT_QueryOptions,
  InfluxDBClient,
  Point,
  QueryOptions,
} from '../../src'
import {expectResolve, expectThrowsAsync} from '../util'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

const grpcVersion: string =
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  require('../../../../node_modules/@grpc/grpc-js/package.json').version

const USER_AGENT = `grpc-node-js/${grpcVersion}`

describe('query api tests', () => {
  describe('query api common TestServer tests', () => {
    let server: TestServer
    before('start server', async () => {
      server = new TestServer()
      await server.start()
    })
    beforeEach('reset server', async () => {
      MockService.resetAll()
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
      const data = client.query(query, 'CI_TEST')
      try {
        await data.next()
      } catch (e: any) {
        assert.fail(`failed to get next data value from test server: ${e}`)
      }
      expect(MockService.callCount.doGet).to.equal(1)
      const doGetMap = MockService.callMeta.get(
        MockService.genCallId('doGet', 1)
      )
      expect(doGetMap?.get('user-agent')?.toString()).to.equal(USER_AGENT)
      expect(doGetMap?.get('authorization')?.toString()).to.equal(
        'Bearer TEST_TOKEN'
      )
      const ticket = MockService.getCallTicketDecoded(
        MockService.genCallId('doGet', 1)
      )
      expect(ticket).to.deep.equal({
        database: 'CI_TEST',
        sql_query: 'SELECT * FROM wumpus',
        query_type: 'sql',
        params: {},
      })
    })
    it('sends a query with options', async () => {
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        headers: {
          extra: 'yes',
        },
      })
      const qOpts: QueryOptions = {
        ...DEFAULT_QueryOptions,
        headers: {
          formula: 'x16',
          'channel-pref': 'h3',
        },
      }
      const query = `SELECT * FROM wumpus`
      const data = client.query(query, 'CI_TEST', qOpts)
      try {
        await data.next()
      } catch (e: any) {
        assert.fail(`failed to get next data value from test server: ${e}`)
      }
      expect(MockService.callCount.doGet).to.equal(1)
      const doGetMap = MockService.callMeta.get(
        MockService.genCallId('doGet', 1)
      )
      expect(doGetMap?.get('user-agent')?.toString()).to.equal(USER_AGENT)
      expect(doGetMap?.get('authorization')?.toString()).to.equal(
        'Bearer TEST_TOKEN'
      )
      expect(doGetMap?.get('extra')?.toString()).to.equal('yes')
      expect(doGetMap?.get('formula')?.toString()).to.equal('x16')
      expect(doGetMap?.get('channel-pref')?.toString()).to.equal('h3')
      const ticket = MockService.getCallTicketDecoded(
        MockService.genCallId('doGet', 1)
      )
      expect(ticket).to.deep.equal({
        database: 'CI_TEST',
        sql_query: 'SELECT * FROM wumpus',
        query_type: 'sql',
        params: {},
      })
    })
    it('uses all header options on query', async () => {
      const client = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        headers: {
          extra: 'yes', // universal header - shared by write and query APIs
        },
        queryOptions: {
          headers: {
            special: 'super', // universal query header
            'change-it': 'caspar', // universal to be overwitten by call
          },
        },
      })
      const data = client.query('SELECT * from wumpus', 'CI_TEST', {
        type: 'sql',
        headers: {
          'one-off': 'top of the league', // one-off query header
          'change-it': 'balthazar', // over-write universal value
        },
      })
      try {
        // N.B. remember, it's a generator and next must be called to yield response
        await data.next()
      } catch (e: any) {
        assert.fail(`failed to get next data value from test server: ${e}`)
      }
      expect(MockService.callCount.doGet).to.equal(1)
      const extra = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'extra'
      )?.toString()
      const special = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'special'
      )?.toString()
      const oneOff = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'one-off'
      )?.toString()
      const changeIt = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'change-it'
      )?.toString()
      expect(extra).to.equal('yes')
      expect(special).to.equal('super')
      expect(oneOff).to.equal('top of the league')
      expect(changeIt).to.equal('balthazar')
    })
    it('sends a query with headers and params', async () => {
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        headers: {
          extra: 'yes',
        },
        queryOptions: {
          headers: {
            special: 'super',
          },
          params: {
            ecrivain: 'E_ZOLA',
            acteur: 'R_NAVARRE',
          },
        },
      })
      const query =
        'SELECT * FROM wumpus WHERE "writer" = $ecrivain AND "painter" = $peintre AND "actor" = $acteur'
      const data = client.query(query, 'CI_TEST', {
        type: 'sql',
        headers: {
          'one-off': 'top of the league', // one-off query header
          'change-it': 'balthazar', // over-write universal value
        },
        params: {
          peintre: 'F_LEGER',
          acteur: 'A_ARTAUD',
        },
      })
      try {
        await data.next()
      } catch (e: any) {
        assert.fail(`failed to get next data value from test server: ${e}`)
      }
      expect(MockService.callCount.doGet).to.equal(1)
      const ticket = MockService.getCallTicketDecoded(
        MockService.genCallId('doGet', 1)
      )
      expect(ticket).to.deep.equal({
        database: 'CI_TEST',
        sql_query: query,
        params: {
          ecrivain: 'E_ZOLA',
          acteur: 'A_ARTAUD',
          peintre: 'F_LEGER',
        },
        query_type: 'sql',
      })
      const extra = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'extra'
      )?.toString()
      const special = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'special'
      )?.toString()
      const auth = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'authorization'
      )?.toString()
      const agent = MockService.getCallMeta(
        MockService.genCallId('doGet', 1),
        'user-agent'
      )?.toString()
      expect(extra).to.equal('yes')
      expect(special).to.equal('super')
      expect(auth).to.equal('Bearer TEST_TOKEN')
      expect(agent).to.equal(USER_AGENT)
    })
    it('sends a query with influxql type', async () => {
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        queryOptions: {
          type: 'influxql',
        },
      })
      const data = client.query('SELECT * FROM wumpus', 'CI_TEST')
      try {
        await data.next()
      } catch (e: any) {
        assert.fail(`failed to get next data value from test server: ${e}`)
      }
      expect(MockService.callCount.doGet).to.equal(1)
      const ticket = MockService.getCallTicketDecoded(
        MockService.genCallId('doGet', 1)
      )
      expect(ticket).to.deep.equal({
        database: 'CI_TEST',
        sql_query: 'SELECT * FROM wumpus',
        query_type: 'influxql',
        params: {},
      })
    })
    it('grpc - fails on large received message', async () => {
      // const blobSize = (1024 * 1024 * 4) + 1000
      const blobSize = 1024 * 1024 * 4 + 1000
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        headers: {
          extra: 'yes',
          sendBlob: `${blobSize}`,
        },
        queryOptions: {
          headers: {
            special: 'super',
          },
          params: {
            ecrivain: 'E_ZOLA',
            acteur: 'R_NAVARRE',
          },
        },
      })

      await expectThrowsAsync(
        async () => {
          const data = client.query('SELECT * FROM wumpus', 'CI_TEST')
          await data.next()
        },
        'Received message larger than max (4195310 vs 4194304)',
        'RpcError'
      )
    })
    it('grpc - sets large receive message size', async () => {
      const blobSize = 1024 * 1024 * 4 + 1000
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        headers: {
          extra: 'yes',
          sendBlob: `${blobSize}`,
        },
        queryOptions: {
          headers: {
            special: 'super',
          },
          params: {
            ecrivain: 'E_ZOLA',
            acteur: 'R_NAVARRE',
          },
          grpcOptions: {
            'grpc.max_receive_message_length': blobSize + 100,
          },
        },
      })

      await expectResolve(async () => {
        const data = client.query('SELECT * FROM wumpus', 'CI_TEST')
        await data.next()
      })
    })
    it('grpc - fails on a restricted send message size', async () => {
      const blobSize = 65536
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        headers: {
          extra: 'yes',
          sendBlob: `${blobSize}`,
        },
        queryOptions: {
          headers: {
            special: 'super',
          },
          params: {
            ecrivain: 'E_ZOLA',
            acteur: 'R_NAVARRE',
          },
          grpcOptions: {
            'grpc.max_send_message_length': 16,
          },
        },
      })

      await expectThrowsAsync(
        async () => {
          const data = client.query('SELECT * FROM wumpus', 'CI_TEST')
          await data.next()
        },
        'Attempted to send message with a size larger than 16',
        'RpcError'
      )
    })
    it('times out', async function () {
      this.timeout(3000)
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        queryTimeout: 100,
        headers: {
          extra: 'yes',
          delay: '2000',
        },
        queryOptions: {
          headers: {
            special: 'super',
          },
          params: {
            ecrivain: 'E_ZOLA',
            acteur: 'R_NAVARRE',
          },
          grpcOptions: {
            'grpc.max_send_message_length': 256,
          },
        },
      })

      await expectThrowsAsync(
        async () => {
          const data = client.query('SELECT * FROM wumpus', 'CI_TEST')
          await data.next()
        },
        /^Deadline exceeded.*/,
        'RpcError'
      )
    })

    it('timeout in ClientOptions', async function () {
      this.timeout(3000)
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        timeout: 10_000,
        queryTimeout: 0,
      })

      await expectThrowsAsync(
        async () => {
          const data = client.query('SELECT * FROM wumpus', 'CI_TEST')
          await data.next()
        },
        /^Deadline exceeded.*/,
        'RpcError'
      )
    })

    it('timeout in ClientOptions should not effecting query timeout', async function () {
      this.timeout(3000)
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        timeout: 10_000,
      })

      await expectThrowsAsync(
        async () => {
          const data = client.query('SELECT * FROM wumpus', 'CI_TEST', {
            timeout: 0,
          })
          await data.next()
        },
        /^Deadline exceeded.*/,
        'RpcError'
      )
    })

    it('passing timeout directly to query function', async function () {
      this.timeout(3000)
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        queryTimeout: 10_000,
        timeout: 10_000,
      })

      await expectThrowsAsync(
        async () => {
          const data = client.query('SELECT * FROM wumpus', 'CI_TEST', {
            timeout: 0,
          })
          await data.next()
        },
        /^Deadline exceeded.*/,
        'RpcError'
      )
    })

    it('passing timeout directly to queryPoints function', async function () {
      this.timeout(3000)
      const client: InfluxDBClient = new InfluxDBClient({
        host: `http://localhost:${server.port}`,
        token: 'TEST_TOKEN',
        database: 'CI_TEST',
        queryTimeout: 10_000,
        timeout: 10_000,
      })

      await expectThrowsAsync(
        async () => {
          const data = client.queryPoints('SELECT * FROM wumpus', 'CI_TEST', {
            timeout: 0,
          })
          await data.next()
        },
        /^Deadline exceeded.*/,
        'RpcError'
      )
    })
  })

  describe('query with mock Flight Server with actual data', () => {
    it('query null fields success', async () => {
      const service = new (class extends BaseFlightService {
        doGet(
          call: grpc.ServerWritableStream<flt.Ticket, flt.FlightData>
        ): void {
          const table = new Table({
            gpu: vectorFromArray(['amd', null], new Utf8()),
            model: vectorFromArray([2009, 2018], new Int32()),
          })
          const messageReader = new MessageReader(tableToIPC(table))
          let message = messageReader.readMessage()
          while (message) {
            const dataBody = messageReader.readMessageBody(message.bodyLength)
            call.write({
              dataHeader: Message.encode(message),
              appMetadata: new Uint8Array(0),
              dataBody: dataBody || undefined,
            })
            message = messageReader.readMessage()
          }
          call.end()
        }
      })()
      const testServer = new TestServer(service, 5555)
      try {
        await testServer.start()
        const client: InfluxDBClient = new InfluxDBClient({
          host: `http://0.0.0.0:${testServer.port}`,
          token: 'TEST_TOKEN',
          database: 'CI_TEST',
        })
        const query = `SELECT * FROM wumpus`
        let data = client.query(query, 'CI_TEST')
        let row = (await data.next()).value as Record<string, any>
        expect(row['gpu']).equals('amd')
        expect(row['model']).equals(2009)

        row = (await data.next()).value as Record<string, any>
        expect(row['gpu']).to.null
        expect(row['model']).equals(2018)

        data = client.queryPoints(query, 'CI_TEST')
        let point = (await data.next()).value as Point
        expect(point.getField('gpu')).equals('amd')
        expect(point.getField('model')).equals(2009)

        point = (await data.next()).value as Point
        expect(point.getField('gpu')).undefined
        expect(point.getField('model')).equals(2018)
      } finally {
        await testServer.shutdown()
      }
    })
  })
})
