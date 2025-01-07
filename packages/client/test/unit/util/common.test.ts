import {isNumber} from '../../../src'
import {expect} from 'chai'
import {isUnsignedNumber} from '../../../src/util/common'

describe('Test functions in common', () => {
  const pairs: Array<{value: any; expect: boolean}> = [
    {value: 1, expect: true},
    {value: -1, expect: true},
    {value: -1.2, expect: true},
    {value: '-1.2', expect: true},
    {value: '2', expect: true},
    {value: 'a', expect: false},
    {value: 'true', expect: false},
    {value: '', expect: false},
    {value: ' ', expect: false},
    {value: '32a', expect: false},
    {value: '32 ', expect: false},
    {value: null, expect: false},
    {value: undefined, expect: false},
    {value: NaN, expect: false},
  ]
  pairs.forEach((pair) => {
    it(`check if ${pair.value} is a valid number`, () => {
      expect(isNumber(pair.value)).to.equal(pair.expect)
    })
  })

  const pairs1: Array<{value: any; expect: boolean}> = [
    {value: 1, expect: true},
    {value: 1.2, expect: true},
    {value: '1.2', expect: true},
    {value: '2', expect: true},
    {value: -2.3, expect: false},
    {value: '-2.3', expect: false},
    {value: 'a', expect: false},
    {value: 'true', expect: false},
    {value: '', expect: false},
    {value: ' ', expect: false},
    {value: '32a', expect: false},
    {value: '32 ', expect: false},
    {value: null, expect: false},
    {value: undefined, expect: false},
    {value: NaN, expect: false},
  ]

  pairs1.forEach((pair) => {
    it(`check if ${pair.value} is a valid unsigned number`, () => {
      expect(isUnsignedNumber(pair.value)).to.equal(pair.expect)
    })
  })
})
