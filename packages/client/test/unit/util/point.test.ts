import {expect} from 'chai'
import {Point, PointValues, convertTime} from '../../../src'

describe('point', () => {
  it('creates point with various fields', () => {
    const point = Point.measurement('blah')
      .setBooleanField('truthy', true)
      .setBooleanField('falsy', false)
      .setIntegerField('intFromString', '20')
      .setFloatField('floatFromString', '60.3')
      .setStringField('str', 'abc')
      .setTimestamp('')
    expect(point.toLineProtocol()).to.equal(
      'blah falsy=F,floatFromString=60.3,intFromString=20i,str="abc",truthy=T'
    )
  })

  it('fails on invalid fields', () => {
    expect(() => {
      Point.measurement('a').setIntegerField('fails', NaN)
    }).to.throw(`invalid integer value for field 'fails': 'NaN'`)

    expect(() => {
      Point.measurement('a').setIntegerField('fails', Infinity)
    }).to.throw(`invalid integer value for field 'fails': 'Infinity'!`)

    expect(() => {
      Point.measurement('a').setIntegerField('fails', 9223372036854776e3)
    }).to.throw(
      `invalid integer value for field 'fails': '9223372036854776000'!`
    )
    expect(() => {
      Point.measurement('a').setFloatField('fails', Infinity)
    }).to.throw(`invalid float value for field 'fails': 'Infinity'!`)

    expect(() => {
      Point.measurement('a').setUintegerField('fails', NaN)
    }).to.throw(`uint value for field 'fails' out of range: NaN`)

    expect(() => {
      Point.measurement('a').setUintegerField('fails', -1)
    }).to.throw(`uint value for field 'fails' out of range: -1`)

    expect(() => {
      Point.measurement('a').setUintegerField(
        'fails',
        Number.MAX_SAFE_INTEGER + 10
      )
    }).to.throw(
      `uint value for field 'fails' out of range: ${
        Number.MAX_SAFE_INTEGER + 10
      }`
    )

    expect(() => {
      Point.measurement('a').setUintegerField('fails', '10a8')
    }).to.throw(`uint value has an unsupported character at pos 2: 10a8`)

    expect(() => {
      Point.measurement('a').setUintegerField('fails', '18446744073709551616')
    }).to.throw(
      `uint value for field 'fails' out of range: 18446744073709551616`
    )
  })

  it('infers type when no type supported', () => {
    const point = Point.measurement('a')
      .setFields({
        float: 20.3,
        float2: 20,
        string: 'text',
        bool: true,
        nothing: undefined as any,
      })
      .setTimestamp('')
    expect(point.toLineProtocol()).to.equal(
      'a bool=T,float=20.3,float2=20,string="text"'
    )
  })

  it('throws when invalid type for method field is provided', () => {
    expect(() => {
      Point.measurement('a').setField('errorlike', undefined, 'bad-type' as any)
    }).to.throw(
      `invalid field type for field 'errorlike': type -> bad-type, value -> undefined!`
    )
  })

  it('adds field using field method', () => {
    const point = Point.measurement('blah')
      .setField('truthy', true, 'boolean')
      .setField('falsy', false, 'boolean')
      .setField('intFromString', '20', 'integer')
      .setField('floatFromString', '60.3', 'float')
      .setField('str', 'abc', 'string')
      .setTimestamp('')
    expect(point.toLineProtocol()).to.equal(
      'blah falsy=F,floatFromString=60.3,intFromString=20i,str="abc",truthy=T'
    )
  })

  it('creates point with uint fields', () => {
    const point = Point.measurement('a')
      .setUintegerField('floored', 10.88)
      .setUintegerField('fromString', '789654123')
      .setTimestamp('')
    expect(point.toLineProtocol()).to.equal(
      'a floored=10u,fromString=789654123u'
    )
  })

  it('returns field of with getField and throws if type not match', () => {
    const point = Point.measurement('a').setFields({
      float: 20.3,
      float2: 20,
      string: 'text',
      bool: true,
      nothing: undefined as any,
    })
    expect(point.getField('float', 'float')).to.equal(20.3)
    expect(point.getField('float2', 'float')).to.equal(20)
    expect(point.getField('string', 'string')).to.equal('text')
    expect(point.getField('bool', 'boolean')).to.equal(true)
    expect(() => {
      point.getField('bool', 'float')
    }).to.throw(`field bool of type boolean doesn't match expected type float!`)
    expect(() => {
      point.getField('string', 'boolean')
    }).to.throw(
      `field string of type string doesn't match expected type boolean!`
    )
  })

  it('creates deep copy of point', () => {
    const point = Point.measurement('measure1')
      .setBooleanField('truthy', true)
      .setBooleanField('falsy', false)
      .setIntegerField('intFromString', '20')
      .setUintegerField('intFromString', '20')
      .setFloatField('floatFromString', '60.3')
      .setStringField('str', 'abc')
      .setTimestamp('')

    const copy = point.copy()

    expect(copy.toLineProtocol()).to.equal(point.toLineProtocol())

    copy.setIntegerField('truthy', 1)

    expect(copy.toLineProtocol()).to.not.equal(point.toLineProtocol())
  })

  describe('convert point time to line protocol', () => {
    const precision = 'ms'
    const clinetConvertTime = (value: Parameters<typeof convertTime>[0]) =>
      convertTime(value, precision)

    it('converts empty string to no timestamp', () => {
      const p = Point.measurement('a').setFloatField('b', 1).setTimestamp('')
      expect(p.toLineProtocol(clinetConvertTime)).equals('a b=1')
    })
    it('converts number to timestamp', () => {
      const p = Point.measurement('a').setFloatField('b', 1).setTimestamp(1.2)
      expect(p.toLineProtocol(clinetConvertTime)).equals('a b=1 1')
    })
    it('converts Date to timestamp', () => {
      const d = new Date()
      const p = Point.measurement('a').setFloatField('b', 1).setTimestamp(d)
      expect(p.toLineProtocol(precision)).equals(`a b=1 ${d.getTime()}`)
    })
    it('converts undefined to local timestamp', () => {
      const p = Point.measurement('a').setFloatField('b', 1)
      expect(p.toLineProtocol(precision)).satisfies((x: string) => {
        return x.startsWith('a b=1')
      }, `does not start with 'a b=1'`)
      expect(p.toLineProtocol(precision)).satisfies((x: string) => {
        return Date.now() - Number.parseInt(x.substring('a b=1 '.length)) < 1000
      })
    })
    it('toString() works same as toLineProtocol()', () => {
      const p = Point.measurement('a')
        .setFloatField('b', 1)
        .setTag('c', 'd')
        .setTimestamp('')
      expect(p.toLineProtocol()).equals(p.toString())
    })
  })

  describe('point values', () => {
    it ('convert point values to point', () => {
      const v = new PointValues()
          .setMeasurement('a')
          .setField('b', 1)
          .setTag('c', 'd')
          .setTimestamp(150);
      const p = Point.fromValues(v);
      expect('a,c=d b=1 150').equals(p.toString())
    })

    it ('convert point values to point with undefined measurement', () => {
        const v = new PointValues()
            .setMeasurement('')
            .setField('b', 1)
            .setTag('c', 'd')
            .setTimestamp(150);
        expect(() => {
            Point.fromValues(v);
        }).to.throw(
            `Cannot convert values to point without measurement set!`
        )

    })
  })
})
