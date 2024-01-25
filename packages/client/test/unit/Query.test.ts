import {expect} from 'chai'
import {TicketDataType} from '../../src/impl/QueryApiImpl'
import {Ticket} from '../../src/generated/flight/Flight'
import {QParamType} from '../../src/QueryApi'
import {allParamsMatched, queryHasParams} from '../../src/util/sql'

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
    const query = 'SELECT a, b, c FROM my_table WHERE id = $id AND name = $name'
    expect(queryHasParams('select * ')).to.be.false
    expect(queryHasParams(query)).to.be.true
    const queryParams: Map<string, QParamType> = new Map<string, QParamType>()
    queryParams.set('id', 42)
    queryParams.set('name', 'Zaphrod')
    expect(allParamsMatched(query, queryParams)).to.be.true
  })
  it('throws error on missing param', () => {
    const query = 'SELECT a, b, c FROM my_table WHERE id = $id AND name = $name'
    expect(queryHasParams(query)).to.be.true
    const queryParams: Map<string, QParamType> = new Map<string, QParamType>()
    queryParams.set('id', 42)
    queryParams.set('key', 'Zaphrod')
    expect(() => {
      allParamsMatched(query, queryParams)
    }).to.throw('No parameter matching  $name provided in the query params map')
  })
})
