import {expect} from 'chai'
import sinon from 'sinon'
import {
  InfluxDBClient,
  ClientOptions,
  Transport,
  WriteOptions,
  WritePrecision,
  DEFAULT_ConnectionOptions,
} from '../../src'
import type WriteApi from '../../src/WriteApi'
import type QueryApi from '../../src/QueryApi'
import {rejects} from 'assert'
import nock from 'nock'

describe('InfluxDB', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('uses options database', () => {
    const database = 'my-db'
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
      token: 'my-token',
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

    expect(queryStub.calledOnceWith(query, database)).to.be.true
    queryStub.resetHistory()

    client.query(query, 'another')
    expect(queryStub.calledOnceWith(query, 'another')).to.be.true

    // queryPoints
    client.queryPoints(query)

    expect(queryPointsStub.calledOnceWith(query, database)).to.be.true
    queryPointsStub.resetHistory()

    client.queryPoints(query, 'another')
    expect(queryPointsStub.calledOnceWith(query, 'another')).to.be.true
  })

  it('throws when no database provided', async () => {
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
      token: 'my-token',
    })

    expect(() => client.query('query')).to.throw(`\
Please specify the 'database' as a method parameter or use default configuration \
at 'ClientOptions.database'
`)
    await rejects(client.write('data'))
  })

  it('throws when no database provided queryPoints', async () => {
    const client = new InfluxDBClient({
      host: 'http://localhost:8086',
      token: 'my-token',
    })

    expect(() => client.queryPoints('query')).to.throw(`\
Please specify the 'database' as a method parameter or use default configuration \
at 'ClientOptions.database'
`)
    await rejects(client.write('data'))
  })

  describe('constructor with ClientOptions', () => {
    it('is created with host and token', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086',
            token: 'my-token',
          }) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with host with trailing slash and token', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086/',
            token: 'my-token',
          }) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
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
            token: 'my-token',
          })
      ).to.throw('Unsupported')
    })
    it('fails on missing token', () => {
      expect(
        () =>
          new InfluxDBClient({
            host: 'http://localhost:8086',
          })
      ).to.throw('No token specified!')
    })
    it('creates instance with transport initialized', () => {
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          token: 'my-token',
        })
      )
        .property('_writeApi')
        .has.property('_transport')
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          token: 'my-token',
          transport: null,
        } as any as ClientOptions)
      )
        .property('_writeApi')
        .has.property('_transport')
      expect(
        new InfluxDBClient({
          host: 'http://localhost:8086',
          token: 'my-token',
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
          token: 'my-token',
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
    it('creates instance with noSync=true', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086/',
            token: 'my-token',
            writeOptions: {
              noSync: true,
            } as WriteOptions,
          }) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: true,
        },
      })
    })
    it('creates instance with noSync=false', () => {
      expect(
        (
          new InfluxDBClient({
            host: 'https://localhost:8086/',
            token: 'my-token',
            writeOptions: {
              noSync: false,
            } as WriteOptions,
          }) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: false,
        },
      })
    })
    it('creates instance with grpc options', () => {
      const expectedOptions = {
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        grpcOptions: {
          'grpc.max_receive_message_length': 65536,
          'grpc.max_send_message_length': 65536,
        },
        queryOptions: {
          grpcOptions: {
            'grpc.max_receive_message_length': 65536,
            'grpc.max_send_message_length': 65536,
          },
        },
      }
      const clients = {
        client1: new InfluxDBClient({
          host: 'https://localhost:8086',
          token: 'my-token',
          queryOptions: {
            grpcOptions: {
              'grpc.max_receive_message_length': 65536,
              'grpc.max_send_message_length': 65536,
            },
          },
        }),
        client2: new InfluxDBClient({
          host: 'https://localhost:8086',
          token: 'my-token',
          grpcOptions: {
            'grpc.max_receive_message_length': 65536,
            'grpc.max_send_message_length': 65536,
          },
        }),
        client3: new InfluxDBClient({
          host: 'https://localhost:8086',
          token: 'my-token',
          grpcOptions: {
            'grpc.max_receive_message_length': 65536,
            'grpc.max_send_message_length': 65536,
          },
          queryOptions: {
            grpcOptions: {
              'grpc.max_receive_message_length': 32768,
              'grpc.max_send_message_length': 32768,
            },
          },
        }),
      }
      for (const client of Object.values(clients)) {
        expect((client as any)._options).to.deep.equal(expectedOptions)
      }
    })
  })

  describe('constructor with connection string', () => {
    it('fails on unsupported protocol', () => {
      expect(
        () => new InfluxDBClient('ws://localhost:8086?token=my-token')
      ).to.throw('Unsupported')
    })
    it('fails on missing token', () => {
      expect(() => new InfluxDBClient('https://localhost:8086')).to.throw(
        'No token specified!'
      )
    })
    it('is created with token', () => {
      expect(
        (new InfluxDBClient('https://localhost:8086?token=my-token') as any)
          ._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with token and auth scheme', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&authScheme=my-scheme'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        authScheme: 'my-scheme',
      })
    })
    it('is created with token + has whitespaces around (#194)', () => {
      expect(
        (new InfluxDBClient(' https://localhost:8086?token=my-token ') as any)
          ._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with token and database', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&database=my-database'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        database: 'my-database',
      })
    })
    it('is created with token and timeout', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&timeout=75'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        timeout: 75,
      })
    })
    it('is created with precision', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&precision=us'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
        } as WriteOptions,
      })
    })
    it('is created with long precision', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&precision=millisecond'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'ms' as WritePrecision,
        } as WriteOptions,
      })
    })
    it('is created with gzip threshold', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&gzipThreshold=128'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          gzipThreshold: 128,
        } as WriteOptions,
      })
    })
    it('creates instance with noSync=true', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&writeNoSync=true'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: true,
        } as WriteOptions,
      })
    })
    it('creates instance with noSync=false', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&writeNoSync=false'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: false,
        } as WriteOptions,
      })
    })
    it('creates instance with noSync=false for invalid input', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&writeNoSync=invalid'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: false,
        } as WriteOptions,
      })
    })
    it('is created with precision, gzip threshold and writeNoSync', () => {
      expect(
        (
          new InfluxDBClient(
            'https://localhost:8086?token=my-token&precision=us&gzipThreshold=128&writeNoSync=true'
          ) as any
        )._options
      ).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
          gzipThreshold: 128,
          noSync: true,
        } as WriteOptions,
      })
    })
  })

  describe('constructor from environment variables', () => {
    const clear = () => {
      delete process.env['INFLUX_HOST']
      delete process.env['INFLUX_TOKEN']
      delete process.env['INFLUX_AUTH_SCHEME']
      delete process.env['INFLUX_DATABASE']
      delete process.env['INFLUX_TIMEOUT']
      delete process.env['INFLUX_PRECISION']
      delete process.env['INFLUX_GZIP_THRESHOLD']
      delete process.env['INFLUX_WRITE_NO_SYNC']
      delete process.env['INFLUX_GRPC_OPTIONS']
    }
    it('fails on missing host', () => {
      clear()
      expect(() => new InfluxDBClient()).to.throw(
        'INFLUX_HOST variable not set!'
      )
    })
    it('fails on missing token', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      expect(() => new InfluxDBClient()).to.throw(
        'INFLUX_TOKEN variable not set!'
      )
    })
    it('is created with host and token', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with host and token and auth scheme', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_AUTH_SCHEME'] = 'my-scheme'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        authScheme: 'my-scheme',
      })
    })
    it('is created with host and token + has whitespaces around (#194)', () => {
      clear()
      process.env['INFLUX_HOST'] = ' https://localhost:8086 '
      process.env['INFLUX_TOKEN'] = ' my-token '
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
      })
    })
    it('is created with host, token and database', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_DATABASE'] = 'my-database'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        database: 'my-database',
      })
    })
    it('is created with host, token and timeout', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_TIMEOUT'] = '75'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        timeout: 75,
      })
    })
    it('is created with host, token and precision', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_PRECISION'] = 'us'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
        } as WriteOptions,
      })
    })
    it('is created with host, token and long precision', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_PRECISION'] = 'nanosecond'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'ns' as WritePrecision,
        } as WriteOptions,
      })
    })
    it('is created with host, token and gzip threshold', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_GZIP_THRESHOLD'] = '128'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          gzipThreshold: 128,
        } as WriteOptions,
      })
    })
    it('creates instance with noSync=true', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_WRITE_NO_SYNC'] = 'true'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: true,
        } as WriteOptions,
      })
    })
    it('creates instance with noSync=false', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_WRITE_NO_SYNC'] = 'false'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: false,
        } as WriteOptions,
      })
    })
    it('creates instance with noSync=false for invalid input', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_WRITE_NO_SYNC'] = 'invalid'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          noSync: false,
        } as WriteOptions,
      })
    })
    it('is created with host, token, precision, gzip threshold and write-no-sync', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_PRECISION'] = 'us'
      process.env['INFLUX_GZIP_THRESHOLD'] = '128'
      process.env['INFLUX_WRITE_NO_SYNC'] = 'true'
      expect((new InfluxDBClient() as any)._options).to.deep.equal({
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        writeOptions: {
          precision: 'us' as WritePrecision,
          gzipThreshold: 128,
          noSync: true,
        } as WriteOptions,
      })
    })
    it('grpc - creates a host with grpc options', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_GRPC_OPTIONS'] =
        'grpc.max_receive_message_length=65536,grpc.max_send_message_length=65536'
      const expectedOptions = {
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        grpcOptions: {
          'grpc.max_receive_message_length': 65536,
          'grpc.max_send_message_length': 65536,
        },
        queryOptions: {
          grpcOptions: {
            'grpc.max_receive_message_length': 65536,
            'grpc.max_send_message_length': 65536,
          },
        },
      }
      const client: any = new InfluxDBClient()
      expect(client._options).to.deep.equal(expectedOptions)
    })
    it('grpc - handles illegal values in grpc environment variables', () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_GRPC_OPTIONS'] =
        'grpc.max_receive_message_length=65536,grpc.max_send_message_length=65536,grpc.garbled'
      const expectedOptions = {
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        grpcOptions: {
          'grpc.max_receive_message_length': 65536,
          'grpc.max_send_message_length': 65536,
        },
        queryOptions: {
          grpcOptions: {
            'grpc.max_receive_message_length': 65536,
            'grpc.max_send_message_length': 65536,
          },
        },
      }
      const client: any = new InfluxDBClient()
      expect(client._options).to.deep.equal(expectedOptions)
    })
    it('grpc - handles non-standard grpc value', async () => {
      clear()
      process.env['INFLUX_HOST'] = 'https://localhost:8086'
      process.env['INFLUX_TOKEN'] = 'my-token'
      process.env['INFLUX_GRPC_OPTIONS'] =
        'grpc.max_receive_message_length=65536,grpc.max_send_message_length=65536,grpc.foo=bar'
      const expectedOptions = {
        ...DEFAULT_ConnectionOptions,
        host: 'https://localhost:8086',
        token: 'my-token',
        grpcOptions: {
          'grpc.max_receive_message_length': 65536,
          'grpc.max_send_message_length': 65536,
          'grpc.foo': 'bar',
        },
        queryOptions: {
          grpcOptions: {
            'grpc.max_receive_message_length': 65536,
            'grpc.max_send_message_length': 65536,
            'grpc.foo': 'bar',
          },
        },
      }
      const client: any = new InfluxDBClient()
      expect(client._options).to.deep.equal(expectedOptions)
    })
  })
  describe('options handling', () => {
    const DATABASE = 'TEST_DATABASE'
    it('merges write options', () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
        writeOptions: {
          gzipThreshold: 1000,
          noSync: true,
          headers: {
            terminate: 'tomorrow',
            'channel-preference': 'irish',
          },
        },
      })
      const options = client['_mergeWriteOptions']({
        precision: 's',
        noSync: false,
        headers: {
          hunter: 'H. Hancock',
        },
      })
      expect(options).to.deep.equal({
        gzipThreshold: 1000,
        headers: {
          terminate: 'tomorrow',
          'channel-preference': 'irish',
          hunter: 'H. Hancock',
        },
        precision: 's',
        noSync: false,
      })
    })
    it('merges write options with preference for method arg', async () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
        headers: {
          preserve: '2d',
        },
        writeOptions: {
          gzipThreshold: 1000,
          headers: {
            terminate: 'tomorrow',
            'channel-preference': 'irish',
            hunter: 'maori',
          },
        },
      })
      const options = client['_mergeWriteOptions']({
        precision: 's',
        headers: {
          terminate: '12h',
          hunter: 'H. Hancock',
        },
        gzipThreshold: 500,
      })
      expect(options).to.deep.equal({
        gzipThreshold: 500,
        headers: {
          terminate: '12h',
          'channel-preference': 'irish',
          hunter: 'H. Hancock',
        },
        precision: 's',
      })
    })
    it('uses all header options on write', async () => {
      let extra: any
      let special: any
      let oneOff: any
      nock('http://test:8086')
        .post(`/api/v2/write?bucket=${DATABASE}&precision=ns`)
        .reply(
          204,
          function (_uri, _body, callback) {
            extra = this.req.headers['extra']
            special = this.req.headers['special']
            oneOff = this.req.headers['one-off']
            callback(null, '..')
          },
          {
            'content-type': 'application/csv',
          }
        )
        .persist()
      const client = new InfluxDBClient({
        host: 'http://test:8086',
        token: 'TEST_TOKEN',
        database: DATABASE,
        headers: {
          extra: 'yes',
        },
        writeOptions: {
          headers: {
            special: 'super',
          },
        },
      })
      await client.write('lpdata', undefined, undefined, {
        headers: {
          'one-off': 'top of the league',
        },
      })
      expect(extra).to.equal('yes')
      expect(special).to.equal('super')
      expect(oneOff).to.equal('top of the league')
    })
    it('merges query options', () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
        queryOptions: {
          headers: {
            terminate: 'tomorrow',
            'channel-preference': 'irish',
          },
          type: 'influxql',
        },
      })
      const options = client['_mergeQueryOptions']({
        headers: {
          hunter: 'H. Hancock',
        },
        params: {
          location: 'tower1',
        },
      })
      expect(options).to.deep.equal({
        type: 'influxql',
        headers: {
          terminate: 'tomorrow',
          'channel-preference': 'irish',
          hunter: 'H. Hancock',
        },
        params: {
          location: 'tower1',
        },
      })
    })
    it('merges query options with preference for method arg', async () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
        queryOptions: {
          headers: {
            terminate: 'tomorrow',
            'channel-preference': 'irish',
          },
          type: 'influxql',
          params: {
            location: 'tower1',
          },
        },
      })
      const options = client['_mergeQueryOptions']({
        headers: {
          hunter: 'H. Hancock',
          terminate: '12h',
        },
        params: {
          location: 'well99',
        },
      })
      expect(options).to.deep.equal({
        type: 'influxql',
        headers: {
          terminate: '12h',
          'channel-preference': 'irish',
          hunter: 'H. Hancock',
        },
        params: {
          location: 'well99',
        },
      })
    })
    it('merges undefined options in method', async () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
        queryOptions: {
          headers: {
            terminate: 'tomorrow',
            'channel-preference': 'irish',
          },
          params: {
            location: 'tower1',
          },
        },
      })
      const options = client['_mergeQueryOptions'](undefined)
      expect(options).to.deep.equal({
        headers: {
          terminate: 'tomorrow',
          'channel-preference': 'irish',
        },
        params: {
          location: 'tower1',
        },
      })
    })
    it('merges undefined options in client options', async () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
      })
      const options = client['_mergeQueryOptions']({
        headers: {
          terminate: 'tomorrow',
          'channel-preference': 'irish',
        },
        params: {
          location: 'tower1',
        },
      })
      expect(options).to.deep.equal({
        headers: {
          terminate: 'tomorrow',
          'channel-preference': 'irish',
        },
        params: {
          location: 'tower1',
        },
      })
    })
    it('handles undefined query options', async () => {
      const client = new InfluxDBClient({
        host: 'http://localhost:8086',
        token: 'TEST_TOKEN',
      })
      const options = client['_mergeQueryOptions'](undefined)
      expect(options).to.deep.equal({headers: {}, params: {}})
    })
  })
})
