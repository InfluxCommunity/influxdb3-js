import {expect} from 'chai'
import {
  HttpError,
  RequestTimedOutError,
  AbortError,
  IllegalArgumentError,
} from '../../src'

describe('errors', () => {
  describe('have standard error properties', () => {
    const pairs: {error: Error; name: string}[] = [
      {error: new HttpError(200, 'OK'), name: 'HttpError'},
      {error: new IllegalArgumentError('Not OK'), name: 'IllegalArgumentError'},
      {error: new RequestTimedOutError(), name: 'RequestTimedOutError'},
      {error: new AbortError(), name: 'AbortError'},
    ]
    pairs.forEach(({error, name}) => {
      describe(`${name}`, () => {
        it('has descriptive name property', () => {
          expect(error.name).equals(name)
        })
        it('has message property', () => {
          expect(error.message).is.not.empty
        })
        it('has expected toString', () => {
          expect(error.toString()).matches(new RegExp(`^${name}:.*`))
        })
      })
    })
  })
  describe('message property is defined', () => {
    expect(new HttpError(200, 'OK').message).is.not.empty
    expect(new IllegalArgumentError('Not OK').message).is.not.empty
    expect(new RequestTimedOutError().message).is.not.empty
    expect(new AbortError().message).is.not.empty
  })
})
