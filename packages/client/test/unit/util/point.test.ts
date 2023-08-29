import {expect} from 'chai'
import {Point, convertTime} from '../../../src'

describe('point', () => {
  it('creates point with various fields', () => {
    const point = new Point()
      .measurement('blah')
      .booleanField('truthy', true)
      .booleanField('falsy', false)
      .intField('intFromString', '20')
      .floatField('floatFromString', '60.3')
      .timestamp('')
    expect(point.toLineProtocol()).to.equal(
      'blah falsy=F,floatFromString=60.3,intFromString=20i,truthy=T'
    )
  })

  it('fails on invalid fields', () => {
    expect(() => {
      new Point().intField('fails', NaN)
    }).to.throw(`invalid integer value for field 'fails': 'NaN'`)

    expect(() => {
      new Point().intField('fails', Infinity)
    }).to.throw(`invalid integer value for field 'fails': 'Infinity'!`)

    expect(() => {
      new Point().intField('fails', 9223372036854776e3)
    }).to.throw(
      `invalid integer value for field 'fails': '9223372036854776000'!`
    )
    expect(() => {
      new Point().floatField('fails', Infinity)
    }).to.throw(`invalid float value for field 'fails': 'Infinity'!`)

    expect(() => {
      new Point().uintField('fails', NaN)
    }).to.throw(`uint value for field 'fails' out of range: NaN`)

    expect(() => {
      new Point().uintField('fails', -1)
    }).to.throw(`uint value for field 'fails' out of range: -1`)

    expect(() => {
      new Point().uintField('fails', Number.MAX_SAFE_INTEGER + 10)
    }).to.throw(
      `uint value for field 'fails' out of range: ${
        Number.MAX_SAFE_INTEGER + 10
      }`
    )

    expect(() => {
      new Point().uintField('fails', '10a8')
    }).to.throw(`uint value has an unsupported character at pos 2: 10a8`)

    expect(() => {
      new Point().uintField('fails', '18446744073709551616')
    }).to.throw(
      `uint value for field 'fails' out of range: 18446744073709551616`
    )
  })

  it('creates point with uint fields', () => {
    const point = new Point('a')
      .uintField('floored', 10.88)
      .uintField('fromString', '789654123')
      .timestamp('')
    expect(point.toLineProtocol()).to.equal(
      'a floored=10u,fromString=789654123u'
    )
  })

  describe('convert point time to line protocol', () => {
    const precision = 'ms'
    const clinetConvertTime = (value: Parameters<typeof convertTime>[0]) =>
      convertTime(value, precision)

    it('converts empty string to no timestamp', () => {
      const p = new Point('a').floatField('b', 1).timestamp('')
      expect(p.toLineProtocol(clinetConvertTime)).equals('a b=1')
    })
    it('converts number to timestamp', () => {
      const p = new Point('a').floatField('b', 1).timestamp(1.2)
      expect(p.toLineProtocol(clinetConvertTime)).equals('a b=1 1')
    })
    it('converts Date to timestamp', () => {
      const d = new Date()
      const p = new Point('a').floatField('b', 1).timestamp(d)
      expect(p.toLineProtocol(precision)).equals(`a b=1 ${d.getTime()}`)
    })
    it('converts undefined to local timestamp', () => {
      const p = new Point('a').floatField('b', 1)
      expect(p.toLineProtocol(precision)).satisfies((x: string) => {
        return x.startsWith('a b=1')
      }, `does not start with 'a b=1'`)
      expect(p.toLineProtocol(precision)).satisfies((x: string) => {
        return Date.now() - Number.parseInt(x.substring('a b=1 '.length)) < 1000
      })
    })
    it('toString() works same as toLineProtocol()', () => {
      const p = new Point('a').floatField('b', 1).tag('c', 'd').timestamp('')
      expect(p.toLineProtocol()).equals(p.toString())
    })
  })
})
