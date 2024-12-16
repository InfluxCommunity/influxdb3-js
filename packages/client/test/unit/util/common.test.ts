import {isNumber} from '../../../src'
import {expect} from 'chai'
import {isUnsignedNumber} from '../../../src/util/common'

describe('Test functions in common', () => {
  it('should check if value is a valid number', () => {
    expect(isNumber(1)).equal(true)
    expect(isNumber(-1)).equal(true)
    expect(isNumber(-1.2)).equal(true)
    expect(isNumber('-1.2')).equal(true)
    expect(isNumber('2')).equal(true)

    expect(isNumber('a')).equal(false)
    expect(isNumber('true')).equal(false)
    expect(isNumber('')).equal(false)
    expect(isNumber(' ')).equal(false)
    expect(isNumber('32a')).equal(false)
    expect(isNumber('32 ')).equal(false)
    expect(isNumber(null)).equal(false)
    expect(isNumber(undefined)).equal(false)
    expect(isNumber(NaN)).equal(false)
  })

  it('should check if value is a valid unsigned number', () => {
    expect(isUnsignedNumber(1)).equal(true)
    expect(isUnsignedNumber(1.2)).equal(true)
    expect(isUnsignedNumber('1.2')).equal(true)
    expect(isUnsignedNumber('2')).equal(true)

    expect(isUnsignedNumber(-2.3)).equal(false)
    expect(isUnsignedNumber('-2.3')).equal(false)
    expect(isUnsignedNumber('a')).equal(false)
    expect(isUnsignedNumber('true')).equal(false)
    expect(isUnsignedNumber('')).equal(false)
    expect(isUnsignedNumber(' ')).equal(false)
    expect(isUnsignedNumber('32a')).equal(false)
    expect(isUnsignedNumber('32 ')).equal(false)
    expect(isUnsignedNumber(null)).equal(false)
    expect(isUnsignedNumber(undefined)).equal(false)
    expect(isUnsignedNumber(NaN)).equal(false)
  })
})
