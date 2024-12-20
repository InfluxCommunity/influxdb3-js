import {
  Bool,
  Field,
  Float64,
  Int64,
  Timestamp,
  TimeUnit,
  Uint64,
  Utf8,
} from 'apache-arrow'
import {getMappedValue} from '../../../src/util/TypeCasting'
import {expect} from 'chai'

describe('Type casting test', () => {
  it('getMappedValue test', () => {
    // If pass the correct value type to getMappedValue() it will return the value with a correct type
    // If pass the incorrect value type to getMappedValue() it will NOT throws any error but return the passed value

    const fieldName = 'test'
    let field: Field

    field = generateIntField(fieldName)
    expect(getMappedValue(field, 1)).to.equal(1)
    expect(getMappedValue(field, 'a')).to.equal('a')

    field = generateUnsignedIntField(fieldName)
    expect(getMappedValue(field, 1)).to.equal(1)
    expect(getMappedValue(field, -1)).to.equal(-1)
    expect(getMappedValue(field, 'a')).to.equal('a')

    field = generateFloatField(fieldName)
    expect(getMappedValue(field, 1.1)).to.equal(1.1)
    expect(getMappedValue(field, 'a')).to.equal('a')

    field = generateBooleanField(fieldName)
    expect(getMappedValue(field, true)).to.equal(true)
    expect(getMappedValue(field, 'a')).to.equal('a')

    field = generateStringField(fieldName)
    expect(getMappedValue(field, 'a')).to.equal('a')
    expect(getMappedValue(field, true)).to.equal(true)

    field = generateTimeStamp(fieldName)
    const nowNanoSecond = Date.now() * 1_000_000
    expect(getMappedValue(field, nowNanoSecond)).to.equal(nowNanoSecond)

    field = generateIntFieldTestTypeMeta(fieldName)
    expect(getMappedValue(field, 1)).to.equal(1)

    // If metadata is null return the value
    field = new Field(fieldName, new Int64(), true, null)
    expect(getMappedValue(field, 1)).to.equal(1)

    // If value is null return null
    field = new Field(fieldName, new Int64(), true, null)
    expect(getMappedValue(field, null)).to.equal(null)
  })
})

function generateIntField(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::field::integer')
  return new Field(name, new Int64(), true, map)
}

function generateUnsignedIntField(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::field::uinteger')
  return new Field(name, new Uint64(), true, map)
}

function generateFloatField(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::field::float')
  return new Field(name, new Float64(), true, map)
}

function generateStringField(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::field::string')
  return new Field(name, new Utf8(), true, map)
}

function generateBooleanField(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::field::boolean')
  return new Field(name, new Bool(), true, map)
}

function generateIntFieldTestTypeMeta(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::field::test')
  return new Field(name, new Int64(), true, map)
}

function generateTimeStamp(name: string): Field {
  const map = new Map<string, string>()
  map.set('iox::column::type', 'iox::column_type::timestamp')
  return new Field(name, new Timestamp(TimeUnit.NANOSECOND), true, map)
}
