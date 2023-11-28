import {expect} from 'chai'
import {Point, PointValues, convertTime} from '../../../src'

describe('point', () => {
  it('creates point with various fields', () => {
    const point = Point.measurement('blah')
      .setMeasurement('')
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
      .setField('uintFromString', '30', 'uinteger')
      .setField('floatFromString', '60.3', 'float')
      .setField('str', 'abc', 'string')
      .setTimestamp('')
    expect(point.toLineProtocol()).to.equal(
      'blah falsy=F,floatFromString=60.3,intFromString=20i,str="abc",truthy=T,uintFromString=30u'
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

  it('change measurement', () => {
    const point = Point.measurement('measurement').setBooleanField(
      'truthy',
      true
    )

    expect('measurement').to.equal(point.getMeasurement())

    point.setMeasurement('measurement2')
    expect('measurement2').to.equal(point.getMeasurement())
  })

  it('get typed fields', () => {
    const point = Point.measurement('measurement')
      .setMeasurement('a')
      .setIntegerField('b', 1)
      .setField('c', 'xyz')
      .setField('d', false)
      .setField('e', 3.45)
      .setUintegerField('f', 8)
      .setStringField('g', 88)
      .setStringField('h', undefined)
      .setBooleanField('i', true)
      .setTimestamp(150)

    expect(1).to.equal(point.getIntegerField('b'))
    expect('88').to.equal(point.getStringField('g'))
    expect(8).to.equal(point.getUintegerField('f'))
    expect(true).to.equal(point.getBooleanField('i'))
    expect(3.45).to.equal(point.getFloatField('e'))
  })

  it('get field type', () => {
    const point = Point.measurement('measurement').setField('a', 3.45)

    expect('float').to.equal(point.getFieldType('a'))
  })

  it('get timestamp', () => {
    const point = Point.measurement('measurement')
      .setField('a', 3.45)
      .setTimestamp(156)

    expect(156).to.equal(point.getTimestamp())
  })

  it('tags', () => {
    const point = Point.measurement('measurement')
      .setTag('tag', 'b')
      .setField('a', 3.45)
      .setTimestamp(156)

    expect('b').to.equal(point.getTag('tag'))
    expect(undefined).to.equal(point.getTag('xyz'))
    expect(['tag']).to.deep.equal(point.getTagNames())

    point.removeTag('tag')
    expect([]).to.deep.equal(point.getTagNames())
  })

  it('uses default tags for line protocol', () => {
    const defaultTags = {a: 'b', c: 'd', '': 'e', f: ''}
    const point = Point.measurement('measurement')
      .setTag('tag', 'b')
      .setTag('a', 'f')
      .setField('a', true)
      .setTimestamp(123)

    expect(point.toLineProtocol(undefined, defaultTags)).to.equal(
      'measurement,c=d,a=f,tag=b a=T 123'
    )
    expect(point.toLineProtocol()).to.equal('measurement,a=f,tag=b a=T 123')

    point.removeTag('a')

    expect(point.toLineProtocol(undefined, defaultTags)).to.equal(
      'measurement,a=b,c=d,tag=b a=T 123'
    )
    expect(point.toLineProtocol()).to.equal('measurement,tag=b a=T 123')
  })

  it('has fields', () => {
    const point1 = Point.measurement('measurement')
      .setTag('c', 'd')
      .setTimestamp(150)
    expect(false).equals(point1.hasFields())
    const point2 = Point.measurement('a')
      .setField('b', 1)
      .setTag('c', 'd')
      .setTimestamp(150)
    expect(true).equals(point2.hasFields())
    expect(['b']).to.deep.equals(point2.getFieldNames())

    point2.removeField('b')
    expect(false).equals(point2.hasFields())
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
    it('without measurement', () => {
      const p = Point.measurement('')
        .setFloatField('b', 1)
        .setTag('c', 'd')
        .setTimestamp('')
      expect(p.toLineProtocol()).equals(undefined)
    })
  })

  describe('point values', () => {
    it('convert point values to point', () => {
      const v = new PointValues()
        .setMeasurement('a')
        .setField('b', 1)
        .setTag('c', 'd')
        .setTimestamp(150)
      const p = Point.fromValues(v)
      expect('a,c=d b=1 150').equals(p.toString())
    })
    it('as point', () => {
      const v = new PointValues()
        .setMeasurement('a')
        .setField('b', 1)
        .setTag('c', 'd')
        .setTimestamp(150)
      let p = v.asPoint()
      expect('a,c=d b=1 150').equals(p.toString())
      p = v.asPoint('x')
      expect('x,c=d b=1 150').equals(p.toString())
    })
    it('convert point values to point with undefined measurement', () => {
      const v = new PointValues()
        .setMeasurement('')
        .setField('b', 1)
        .setTag('c', 'd')
        .setTimestamp(150)
      expect(() => {
        Point.fromValues(v)
      }).to.throw(`Cannot convert values to point without measurement set!`)
    })
    it('has fields', () => {
      const v1 = new PointValues()
        .setMeasurement('a')
        .setTag('c', 'd')
        .setTimestamp(150)
      expect(false).equals(v1.hasFields())
      const v2 = new PointValues()
        .setMeasurement('a')
        .setField('b', 1)
        .setTag('c', 'd')
        .setTimestamp(150)
      expect(true).equals(v2.hasFields())
    })
    it('remove field', () => {
      const v = new PointValues()
        .setMeasurement('a')
        .setField('b', 1)
        .setTag('c', 'd')
        .setTimestamp(150)
      expect(true).eq(v.hasFields())
      v.removeField('b')
      expect(false).equals(v.hasFields())
    })
    it('remove tag', () => {
      const v = new PointValues()
        .setMeasurement('a')
        .setField('b', 1)
        .setTag('c', 'd')
        .setTimestamp(150)
      expect(true).eq(v.getTagNames().includes('c'))
      v.removeTag('c')
      expect(false).eq(v.getTagNames().includes('c'))
    })
    it('field values', () => {
      const v = new PointValues()
        .setMeasurement('a')
        .setIntegerField('b', 1)
        .setField('c', 'xyz')
        .setField('d', false)
        .setField('e', 3.45)
        .setUintegerField('f', 8)
        .setStringField('g', 88)
        .setStringField('h', undefined)
        .setTimestamp(150)
      expect(1).deep.equals(v.getIntegerField('b'))
      expect('xyz').deep.equals(v.getStringField('c'))
      expect(false).deep.equals(v.getBooleanField('d'))
      expect(3.45).deep.equals(v.getFloatField('e'))
      expect(8).deep.equals(v.getUintegerField('f'))
      expect('88').deep.equals(v.getStringField('g'))
    })
  })

  it('undefined field', () => {
    const v = new PointValues()
      .setMeasurement('a')
      .setField('c', 'xyz')
      .setTimestamp(150)
    expect(undefined).deep.equals(v.getField('x'))
    expect(undefined).deep.equals(v.getFieldType('x'))
  })
})
