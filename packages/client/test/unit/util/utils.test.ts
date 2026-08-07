import {expect} from 'chai'
import {collectAll, throwReturn} from '../../../src/util/common'
import {parseUrl, replaceURLProtocolWithPort} from '../../../src/util/fixUrl'

describe('utils', () => {
  it('throwReturn throws given message', () => {
    const message = 'this is error message'
    expect(() => throwReturn(new Error(message))).to.throw(message)
  })

  const fixUrlTests = [
    {
      input: 'http://example.com',
      expected: {safe: false, url: 'example.com:80'},
    },
    {
      input: 'https://example.com',
      expected: {safe: true, url: 'example.com:443'},
    },
    {
      input: 'http://example.com:3000',
      expected: {safe: false, url: 'example.com:3000'},
    },
    {
      input: 'https://example.com:5000',
      expected: {safe: true, url: 'example.com:5000'},
    },
    {
      input: 'http://[2001:db8::1]',
      expected: {safe: false, url: '[2001:db8::1]:80'},
    },
    {
      input: 'https://[2001:db8::1]',
      expected: {safe: true, url: '[2001:db8::1]:443'},
    },
    {
      input: 'http://[2001:db8::1]:8086',
      expected: {safe: false, url: '[2001:db8::1]:8086'},
    },
    {
      input: 'https://[fe80::1%25eth0]',
      expected: {safe: true, url: '[fe80::1%25eth0]:443'},
    },
    {
      input: 'https://[fe80::1%25eth0]:8086',
      expected: {safe: true, url: '[fe80::1%25eth0]:8086'},
    },
  ]

  for (const test of fixUrlTests) {
    it(`fixUrl handles ${test.input}`, () => {
      expect(replaceURLProtocolWithPort(test.input)).to.deep.equal(
        test.expected
      )
    })
  }

  it('collectAll correctly iterate through the generator', async () => {
    const generator = (async function* () {
      yield* [4, 5, 6]
    })()

    const result = await collectAll(generator)

    expect(result).to.deep.equal([4, 5, 6])
  })

  it('test parseUrl()', () => {
    const tests = [
      {
        url: 'https://192.168.0.5/db',
        expect: {
          rawUrl: 'https://192.168.0.5/db',
          protocol: 'https:',
          host: '192.168.0.5:443',
          hostname: '192.168.0.5',
          port: '443',
          pathname: '/db',
          searchParams: new URLSearchParams(),
        },
      },
      {
        url: 'http://192.168.0.1',
        expect: {
          rawUrl: 'http://192.168.0.1',
          protocol: 'http:',
          host: '192.168.0.1:80',
          hostname: '192.168.0.1',
          port: '80',
          pathname: '/',
          searchParams: new URLSearchParams(),
        },
      },
      {
        url: 'http://[2001:db8::1]?db=bucket0&precision=nanosecond',
        expect: {
          rawUrl: 'http://[2001:db8::1]?db=bucket0&precision=nanosecond',
          protocol: 'http:',
          host: '[2001:db8::1]:80',
          hostname: '[2001:db8::1]',
          port: '80',
          pathname: '/',
          searchParams: new URLSearchParams({
            db: 'bucket0',
            precision: 'nanosecond',
          }),
        },
      },
      {
        url: 'https://[fe80::1%25eth%250]:15000',
        expect: {
          rawUrl: 'https://[fe80::1%25eth%250]:15000',
          protocol: 'https:',
          host: '[fe80::1%25eth%250]:15000',
          hostname: '[fe80::1%25eth%250]',
          port: '15000',
          pathname: '/',
          searchParams: new URLSearchParams(),
        },
      },
      {
        url: 'https://[2001:db8:a0b:12f0::1%25eth0]:15000?db=bucket0&precision=nanosecond',
        expect: {
          rawUrl:
            'https://[2001:db8:a0b:12f0::1%25eth0]:15000?db=bucket0&precision=nanosecond',
          protocol: 'https:',
          host: '[2001:db8:a0b:12f0::1%25eth0]:15000',
          hostname: '[2001:db8:a0b:12f0::1%25eth0]',
          port: '15000',
          pathname: '/',
          searchParams: new URLSearchParams({
            db: 'bucket0',
            precision: 'nanosecond',
          }),
        },
      },
      {
        url: 'https://[fe80::1%25eth%200]',
        expect: {
          rawUrl: 'https://[fe80::1%25eth%200]',
          protocol: 'https:',
          host: '[fe80::1%25eth%200]:443',
          hostname: '[fe80::1%25eth%200]',
          port: '443',
          pathname: '/',
          searchParams: new URLSearchParams(),
        },
      },
      {
        url: 'https://example.com:3000',
        expect: {
          rawUrl: 'https://example.com:3000',
          protocol: 'https:',
          host: 'example.com:3000',
          hostname: 'example.com',
          port: '3000',
          pathname: '/',
          searchParams: new URLSearchParams(),
        },
      },
      {
        url: 'http://example.com?db=bucket0&precision=nanosecond',
        expect: {
          rawUrl: 'http://example.com?db=bucket0&precision=nanosecond',
          protocol: 'http:',
          host: 'example.com:80',
          hostname: 'example.com',
          port: '80',
          pathname: '/',
          searchParams: new URLSearchParams({
            db: 'bucket0',
            precision: 'nanosecond',
          }),
        },
      },
    ]
    for (const test of tests) {
      const u = parseUrl(test.url)
      expect(u.searchParams.toString()).to.be.equals(
        test.expect.searchParams.toString()
      )
      expect(u).to.deep.equal(test.expect)
    }
  })
})
