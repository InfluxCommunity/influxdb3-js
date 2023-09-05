import {expect} from 'chai'
import {Point} from '../../../src'
import {
  WritableData,
  writableDataToLineProtocol,
} from '../../../src/util/generics'

describe('writableDataToLineProtocol', () => {
  it('should convert single line of line protocol', () => {
    const lp = 'measurement val=0'
    const output = writableDataToLineProtocol(lp)
    expect(output).to.deep.equal([lp])
  })

  it('should convert array-like lines to line protocol', () => {
    const lp1 = 'measurement val=0'
    const lp2 = 'measurement val=1'
    const lp3 = 'measurement val=2'
    const input: WritableData = {0: lp1, 1: lp2, 2: lp3, length: 3}
    const output = writableDataToLineProtocol(input)
    expect(output).to.deep.equal([lp1, lp2, lp3])
  })

  it('should convert single Point to line protocol', () => {
    const point = Point.measurement('test').floatField('blah', 123.6)
    const output = writableDataToLineProtocol(point)
    expect(output.length).to.equal(1)
    expect(output[0]).satisfies((x: string) => {
      return x.startsWith('test blah=123.6')
    }, `does not start with 'test blah=123.6'`)
  })

  it('should convert array-like Point to line protocol', () => {
    const point1 = Point.measurement('test').floatField('blah', 123.6)
    const date = Date.now()
    const point2 = Point.measurement('test')
      .floatField('blah', 456.7)
      .timestamp(date)
    const point3 = Point.measurement('test')
      .floatField('blah', 789.8)
      .timestamp('')
    const input: WritableData = [point1, point2, point3]
    const output = writableDataToLineProtocol(input)
    expect(output.length).to.equal(3)
    expect(output[0]).satisfies((x: string) => {
      return x.startsWith('test blah=123.6')
    }, `does not start with 'test blah=123.6'`)
    expect(output[1]).to.equal(`test blah=456.7 ${date}`)
    expect(output[2]).to.equal('test blah=789.8')
  })
})
