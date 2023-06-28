import {expect} from 'chai'
import {convertTime, convertTimeToNanos, useProcessHrtime} from '../../../src'
import sinon from 'sinon'

describe('time/convertTime', () => {
  let hrtimeStub: sinon.SinonSpy
  let dateNowStub: sinon.SinonStub | undefined

  beforeEach(function () {
    hrtimeStub = sinon.spy(process, 'hrtime')
  })

  afterEach(function () {
    hrtimeStub.restore()
    if (dateNowStub) {
      dateNowStub.restore()
      dateNowStub = undefined
    }
    useProcessHrtime(true)
  })

  it(`it uses hrtime based on settings`, () => {
    useProcessHrtime(false)
    convertTimeToNanos(undefined)
    convertTime(undefined, 'us')

    expect(hrtimeStub.called).to.be.false

    useProcessHrtime(true)
    convertTimeToNanos(undefined)
    convertTime(undefined, 'us')

    expect(hrtimeStub.called).to.be.true
  })

  it('uses right converter', () => {
    const date = new Date(1_000)

    expect(convertTime(date, 's')).to.equal('1')
    expect(convertTime(date, 'ms')).to.equal('1000')
    expect(convertTime(date, 'us')).to.equal('1000000')
    expect(convertTime(date, 'ns')).to.equal('1000000000')
  })

  it('returns different time for ns if hrtime disabled', () => {
    dateNowStub = sinon.stub(Date, 'now').callsFake(() => 1_000_000_000_000)
    useProcessHrtime(false)
    const time1 = convertTime(undefined)
    const time2 = convertTime(undefined)
    expect(time1).to.not.equal(time2)
  })

  it('returns current time if no date provided ', () => {
    dateNowStub = sinon.stub(Date, 'now').callsFake(() => 1_000)
    useProcessHrtime(false)

    expect(convertTime(undefined, 's')).to.equal('1')
    expect(convertTime(undefined, 'ms')).to.equal('1000')
    expect(convertTime(undefined, 'us')).to.equal('1000000')
    expect(convertTime(undefined, 'ns')).to.equal('1000000000')
  })

  it('works in edge cases', () => {
    let time = convertTime(BigInt(10) as any)
    expect(time).to.equal('10')
    time = convertTime('10')
    expect(time).to.equal('10')
  })
})
