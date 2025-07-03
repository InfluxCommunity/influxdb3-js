import sinon from 'sinon'
import {expect} from 'chai'
import {
  ClientOptions,
  fromConnectionString,
  parsePrecision,
  precisionToV2ApiString,
  precisionToV3ApiString,
  WritePrecision,
} from '../../src'

// TODO update Options tests with new GrpcOptions

describe('ClientOptions', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe('constructor with connection string', () => {
    it('with empty', () => {
      expect(() => fromConnectionString('')).to.throw(
        'Connection string not set!'
      )
    })
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

describe('precisionToV2ApiString', () => {
  ;['ns', 'us', 'ms', 's'].forEach((precision: string) => {
    it(`returns '${precision}' for '${precision}'`, () => {
      expect(precisionToV2ApiString(precision as WritePrecision)).to.equal(
        precision
      )
    })
  })

  it('fails for invalid input', () => {
    expect(() => precisionToV2ApiString('invalid' as WritePrecision)).to.throw(
      "Unsupported precision 'invalid'"
    )
  })
})

describe('precisionToV3ApiString', () => {
  ;[
    {precision: 'ns', result: 'nanosecond'},
    {precision: 'us', result: 'microsecond'},
    {precision: 'ms', result: 'millisecond'},
    {precision: 's', result: 'second'},
  ].forEach(({precision, result}) => {
    it(`returns '${result}' for '${precision}'`, () => {
      expect(precisionToV3ApiString(precision as WritePrecision)).to.equal(
        result
      )
    })
  })

  it('fails for invalid input', () => {
    expect(() => precisionToV3ApiString('invalid' as WritePrecision)).to.throw(
      "Unsupported precision 'invalid'"
    )
  })
})

describe('parsePrecision', () => {
  ;[
    {input: 'ns', result: 'ns'},
    {input: 'nanosecond', result: 'ns'},
    {input: 'us', result: 'us'},
    {input: 'microsecond', result: 'us'},
    {input: 'ms', result: 'ms'},
    {input: 'millisecond', result: 'ms'},
    {input: 's', result: 's'},
    {input: 'second', result: 's'},
  ].forEach(({input, result}) => {
    it(`returns '${result}' for '${input}'`, () => {
      expect(parsePrecision(input)).to.equal(result)
    })
  })

  it('fails for invalid input', () => {
    expect(() => parsePrecision('invalid' as WritePrecision)).to.throw(
      "Unsupported precision 'invalid'"
    )
  })
})
