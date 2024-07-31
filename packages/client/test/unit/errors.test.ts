import {expect} from 'chai'
import * as http from 'http'
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
    it('verifies message properties', () => {
      expect(new HttpError(200, 'OK').message).is.not.empty
      expect(new IllegalArgumentError('Not OK').message).is.not.empty
      expect(new RequestTimedOutError().message).is.not.empty
      expect(new AbortError().message).is.not.empty
    })
  })
  describe('HttpError message property is correct', () => {
    it('verifies Cloud error message', () => {
      expect(
        new HttpError(
          400,
          'Bad Request',
          '{"message": "parsing failed for write_lp endpoint"}'
        ).message
      ).equals('parsing failed for write_lp endpoint')
    })
    it('verifies Edge error without detail message', () => {
      expect(
        new HttpError(
          400,
          'Bad Request',
          '{"error": "parsing failed for write_lp endpoint"}'
        ).message
      ).equals('parsing failed for write_lp endpoint')
    })
    it('verifies Edge error with detail message', () => {
      expect(
        new HttpError(
          400,
          'Bad Request',
          '{"error": "parsing failed for write_lp endpoint", "data": {"error_message": "invalid field value in line protocol for field \'value\' on line 0"}}' // Edge
        ).message
      ).equals(
        "invalid field value in line protocol for field 'value' on line 0"
      )
    })
  })
  describe('http error values', () => {
    it('propagate headers', () => {
      const httpHeaders: http.IncomingHttpHeaders = {
        'content-type': 'application/json',
        'retry-after': '42',
      }
      const httpError: HttpError = new HttpError(
        429,
        'Too Many Requests',
        undefined,
        httpHeaders['content-type'],
        httpHeaders
      )
      expect(httpError.headers).is.not.empty
      expect(httpError.contentType).equals('application/json')
      expect(httpError.statusMessage).equals('Too Many Requests')
      if (httpError.headers) {
        expect(httpError.headers['retry-after']).equals('42')
      } else {
        expect.fail('httpError.headers should be defined')
      }
    })
  })
})
