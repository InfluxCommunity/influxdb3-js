import {expect} from 'chai'
import QueryApiImpl, {TicketDataType} from '../../src/impl/QueryApiImpl'
import {ConnectionOptions} from '../../src/options'
import {Ticket} from '../../src/generated/flight/Flight'
import {QParamType} from '../../src/QueryApi'
import {allParamsMatched, queryHasParams} from '../../src/util/sql'
import {RpcMetadata} from '@protobuf-ts/runtime-rpc'

const testSQLTicket = {
  db: 'TestDB',
  query: 'select *',
}

describe('Query', () => {
  it('creates a basic ticket', () => {
    const ticketData: TicketDataType = {
      database: testSQLTicket.db,
      sql_query: testSQLTicket.query,
      query_type: 'sql',
    }

    const ticket = Ticket.create({
      ticket: new TextEncoder().encode(JSON.stringify(ticketData)),
    })

    expect(ticket).to.not.equal(null)

    const ticketDecode = JSON.parse(new TextDecoder().decode(ticket.ticket))

    expect(ticketDecode).to.deep.equal(ticketData)
    expect(ticketDecode.database).to.equal(ticketData.database)
    expect(ticketDecode.sql_query).to.equal(ticketData.sql_query)
    expect(ticketDecode.query_type).to.equal(ticketData.query_type)
  })
  it('creates a basic ticket with params', () => {
    const ticketData: TicketDataType = {
      database: testSQLTicket.db,
      sql_query: testSQLTicket.query,
      query_type: 'sql',
    }
    const queryParams: Map<string, QParamType> = new Map<string, QParamType>()
    queryParams.set('foo', 'bar')
    queryParams.set('fooInt', 42)
    queryParams.set('fooFloat', Math.PI)
    queryParams.set('fooTrue', true)
    const paramHolder: {[name: string]: QParamType | undefined} = {}
    for (const key of queryParams.keys()) {
      if (queryParams.get(key)) {
        paramHolder[key] = queryParams.get(key)
      }
    }
    ticketData['params'] = paramHolder as {
      [name: string]: QParamType | undefined
    }

    const ticket = Ticket.create({
      ticket: new TextEncoder().encode(JSON.stringify(ticketData)),
    })

    expect(ticket).not.to.equal(null)
    const ticketDecode = JSON.parse(new TextDecoder().decode(ticket.ticket))

    expect(ticketDecode).to.deep.equal(ticketData)
  })
  it('matches all params', () => {
    const query = 'SELECT a, b, c FROM my_table WHERE id = $id AND name=$_name'
    expect(queryHasParams('select * ')).to.be.false
    expect(queryHasParams(query)).to.be.true
    const queryParams: Record<string, QParamType> = {}
    queryParams['id'] = 42
    queryParams['_name'] = 'Zaphrod'
    expect(allParamsMatched(query, queryParams)).to.be.true
  })
  it('throws error on missing param', () => {
    const query = 'SELECT a, b, c FROM my_table WHERE id = $id AND name=$_name'
    expect(queryHasParams(query)).to.be.true
    const queryParams: Record<string, QParamType> = {}
    queryParams['id'] = 42
    queryParams['_key'] = 'Zaphrod'
    expect(() => {
      allParamsMatched(query, queryParams)
    }).to.throw('No parameter matching $_name provided in the query params map')
  })
  it('sets header metadata in request', async () => {
    const options: ConnectionOptions = {
      host: 'http://localhost:8086',
      token: 'TEST_TOKEN',
    }
    const qApi = new QueryApiImpl(options)
    const testMeta: Record<string, string> = {
      route: 'CZ66',
    }
    const meta: RpcMetadata = qApi.prepareMetadata(testMeta)
    expect(meta['authorization']).to.equal('Bearer TEST_TOKEN')
    expect(meta['route']).to.equal('CZ66')
  })
  it('gets header metadata from config', async () => {
    const options: ConnectionOptions = {
      host: 'http://localhost:8086',
      token: 'TEST_TOKEN',
      headers: {
        hunter: 'Herbie Hancock',
        feeder: 'Jefferson Airplane',
      },
    }
    const qApi = new QueryApiImpl(options)
    const meta: RpcMetadata = qApi.prepareMetadata()
    expect(meta['authorization']).to.equal('Bearer TEST_TOKEN')
    expect(meta['hunter']).to.equal('Herbie Hancock')
    expect(meta['feeder']).to.equal('Jefferson Airplane')
  })
  it('prefers request header metadata to config', async () => {
    const options: ConnectionOptions = {
      host: 'http://localhost:8086',
      token: 'TEST_TOKEN',
      headers: {
        hunter: 'Maori',
        feeder: 'Lewis Carol',
      },
    }
    const qApi = new QueryApiImpl(options)
    const testMeta: Record<string, string> = {
      hunter: 'Herbie Hancock',
      feeder: 'Jefferson Airplane',
    }
    const meta: RpcMetadata = qApi.prepareMetadata(testMeta)
    expect(meta['authorization']).to.equal('Bearer TEST_TOKEN')
    expect(meta['hunter']).to.equal('Herbie Hancock')
    expect(meta['feeder']).to.equal('Jefferson Airplane')
  })
})
