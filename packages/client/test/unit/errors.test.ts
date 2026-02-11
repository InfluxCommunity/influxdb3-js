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
    it('verifies Core/Enterprise error without detail message', () => {
      expect(
        new HttpError(
          400,
          'Bad Request',
          '{"error": "parsing failed for write_lp endpoint"}'
        ).message
      ).equals('parsing failed for write_lp endpoint')
    })
    it('verifies Core/Enterprise error with detail message', () => {
      expect(
        new HttpError(
          400,
          'Bad Request',
          '{"error": "parsing failed for write_lp endpoint", "data": {"error_message": "invalid field value in line protocol for field \'value\' on line 0"}}'
        ).message
      ).equals(
        "invalid field value in line protocol for field 'value' on line 0"
      )
    })
    it('verifies v3 error format with code and message', () => {
      const err = new HttpError(
        400,
        'Bad Request',
        '{"code":"internal","message":"parsing failed for write_lp endpoint"}'
      )
      expect(err.message).equals('parsing failed for write_lp endpoint')
      expect(err.code).equals('internal')
    })
    it('verifies v3 write error format with details', () => {
      const body = JSON.stringify({
        error: 'partial write of line protocol occurred',
        data: [
          {
            error_message: 'invalid column type for column v',
            line_number: 2,
            original_line: '**.DBG.remote_***',
          },
          {
            error_message: 'only error message',
          },
          null,
        ],
      })
      expect(new HttpError(400, 'Bad Request', body).message).equals(
        'partial write of line protocol occurred:\n' +
          '\tline 2: invalid column type for column v (**.DBG.remote_***)\n' +
          '\tonly error message'
      )
    })
    it('verifies v3 write error format without details', () => {
      const body = JSON.stringify({
        error: 'partial write of line protocol occurred',
        data: [{line_number: 2}],
      })
      expect(new HttpError(400, 'Bad Request', body).message).equals(
        'partial write of line protocol occurred'
      )
    })
    it('verifies v3 write error message includes details', () => {
      const body = JSON.stringify({
        error: 'partial write of line protocol occurred',
        data: [
          {
            error_message:
              "invalid column type for column 'v', expected iox::column_type::field::integer, got iox::column_type::field::float",
            line_number: 2,
            original_line: 'testa6a3ad v=1 17702',
          },
        ],
      })
      const message = new HttpError(400, 'Bad Request', body).message
      expect(message).to.include('partial write of line protocol occurred')
      expect(message).to.include('line 2')
      expect(message).to.include(
        "invalid column type for column 'v', expected iox::column_type::field::integer, got iox::column_type::field::float"
      )
      expect(message).to.include('testa6a3ad v=1 17702')
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
