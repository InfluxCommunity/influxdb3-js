import {expect} from 'chai'
import {Point, PointRecord, convertTime} from '../../../src'

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

  describe('convert record to point', () => {
    it('should correctly convert PointRecord to Point', () => {
      const record: PointRecord = {
        measurement: 'testMeasurement',
        timestamp: 1624512793,
        fields: {
          text: 'testString',
          value: 123.45,
        },
      }
      const point = Point.fromRecord(record)
      expect(point.toLineProtocol()).equals(
        'testMeasurement text="testString",value=123.45 1624512793'
      )
    })
    it('should accept string as timestamp', () => {
      const record: PointRecord = {
        measurement: 'testMeasurement',
        timestamp: '',
        fields: {
          text: 'testString',
          value: 123.45,
        },
      }
      const point = Point.fromRecord(record)
      expect(point.toLineProtocol()).equals(
        'testMeasurement text="testString",value=123.45'
      )
    })
    it('should accept Date as timestamp', () => {
      const date = new Date()
      const record: PointRecord = {
        measurement: 'testMeasurement',
        timestamp: date,
        fields: {
          text: 'testString',
          value: 123.45,
        },
      }
      const point = Point.fromRecord(record)
      expect(point.toLineProtocol()).equals(
        `testMeasurement text="testString",value=123.45 ${convertTime(date)}`
      )
    })
    it('should fail on invalid record', () => {
      expect(() => {
        // no measurement
        Point.fromRecord({} as PointRecord)
      }).to.throw('measurement must be defined on the Point record!')

      expect(() => {
        // no fields prop
        Point.fromRecord({measurement: 'a'} as PointRecord)
      }).to.throw('fields must be defined on the Point record!')

      expect(() => {
        // invalid field type
        Point.fromRecord({
          measurement: 'a',
          fields: {a: {}},
        } as any as PointRecord)
      }).to.throw('unsuported type of field')

      expect(() => {
        // invalid tag type
        Point.fromRecord({
          measurement: 'a',
          fields: {},
          tags: {a: 8},
        } as any as PointRecord)
      }).to.throw('tag has to be string')
    })
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
