## 1.4.0 [2025-09-15]

### CI

1. [#607](https://github.com/InfluxCommunity/influxdb3-js/pull/607) Add tests for arm64 CircleCI.

## 1.3.0 [2025-08-12]

### Features

1. [#585](https://github.com/InfluxCommunity/influxdb3-js/pull/585): Add function to get InfluxDB version.
2. [#588](https://github.com/InfluxCommunity/influxdb3-js/pull/588): Support grpc options available via [@grpc/grpc-js](https://github.com/grpc/grpc-node/blob/master/packages/grpc-js/README.md#supported-channel-options).
   - New client option (`grpcOptions`) added. Accepts key-value pairs available via @grpc/grpc-js.
   - New queryOptions option (`grpcOptions`) added. Accepts key-value pairs available via @grpc/grpc-js.
   - Configurable also with the environment variable (`INFLUXDB_GRPC_OPTIONS`) which takes a comma separated list of key-value pairs.
   - See new example `clientWithGrpcOptions.ts`.
   - Not supported in browser API.
3. [#591](https://github.com/InfluxCommunity/influxdb3-js/pull/591): Add comment warning null when calling getMeasurement function.
4. [#592](https://github.com/InfluxCommunity/influxdb3-js/pull/592): Run integration tests against a locally started InfluxDB 3 Core server.

## 1.2.0 [2025-06-26]

### Features

1. [#574](https://github.com/InfluxCommunity/influxdb3-js/pull/574): Support fast writes without waiting for WAL persistence:
   - New write option (`WriteOptions.noSync`) added: `true` value means faster write but without the confirmation that
     the data was persisted. Default value: `false`.
   - **Supported by self-managed InfluxDB 3 Core and Enterprise servers only!**
   - Also configurable via connection string query parameter (`writeNoSync`).
   - Also configurable via environment variable (`INFLUX_WRITE_NO_SYNC`).
   - Long precision string values added from v3 HTTP API: `"nanosecond"`, `"microsecond"`, `"millisecond"`,
     `"second"` (in addition to the existing `"ns"`, `"us"`, `"ms"`, `"s"`).

### Bugfix

1. [#570](https://github.com/InfluxCommunity/influxdb3-js/pull/570): Fixes the bug that makes query results duplicate rows [#553](https://github.com/InfluxCommunity/influxdb3-js/issues/553).
2. [#575](https://github.com/InfluxCommunity/influxdb3-js/pull/575): Upgrades build ecmascript to `es2023`

## 1.1.0 [2025-03-26]

### Features

1. [#545](https://github.com/InfluxCommunity/influxdb3-js/pull/545): Sets the correct versions for the client-browser package.

## 1.0.0 [2025-01-22]

### Features

1. [#491](https://github.com/InfluxCommunity/influxdb3-js/pull/491): Respect iox::column_type::field metadata when
   mapping query results into values.
    - iox::column_type::field::integer: => number
    - iox::column_type::field::uinteger: => number
    - iox::column_type::field::float: => number
    - iox::column_type::field::string: => string
    - iox::column_type::field::boolean: => boolean
1. [499](https://github.com/InfluxCommunity/influxdb3-js/pull/499): Migrate to new doc library

## 0.12.0 [2024-10-22]

### Bugfix

1. [437](https://github.com/InfluxCommunity/influxdb3-js/pull/437): Simplify iterating over Arrow's batches in `QueryAPI`

## 0.11.0 [2024-09-13]

### Features

1. [410](https://github.com/InfluxCommunity/influxdb3-js/pull/410): Accepts HTTP responses with 2xx status codes as a success for writes.

## 0.10.0 [2024-08-12]

### Features

1. [369](https://github.com/InfluxCommunity/influxdb3-js/pull/369): Propagates headers from HTTP response to HttpError when an error is returned from the server.
1. [377](https://github.com/InfluxCommunity/influxdb3-js/pull/377): Add InfluxDB Edge (OSS) authentication support.

### Bugfix

1. [376](https://github.com/InfluxCommunity/influxdb3-js/pull/376): Handle InfluxDB Edge (OSS) errors better.

## 0.9.0 [2024-06-24]

### Features

1. [319](https://github.com/InfluxCommunity/influxdb3-js/pull/319): Adds standard `user-agent` header to calls.

## 0.8.0 [2024-04-16]

### Breaking Changes

1. [293](https://github.com/InfluxCommunity/influxdb3-js/pull/293): The Query API now uses a `QueryOptions` structure in `client.query()` methods.  The `queryType` and `queryParams` values are now wrapped inside of it.  QueryOptions also support adding custom headers.  Query parameters are changed from type `Map<string, QParamType>` to type `Record<string, QParamType>`.

### Features

1. [293](https://github.com/InfluxCommunity/influxdb3-js/pull/293): `QueryOptions` also support adding custom headers.

## 0.7.0 [2024-03-01]

### Features

1. [#256](https://github.com/InfluxCommunity/influxdb3-js/pull/256): Adds support for named query parameters

## 0.6.0 [2024-01-30]

### Bugfix

1. [#221](https://github.com/InfluxCommunity/influxdb3-js/issues/221): Client options processing

## 0.5.0 [2023-12-05]

### Features

1. [#183](https://github.com/InfluxCommunity/influxdb3-js/pull/183): Default Tags for Writes

## 0.4.1 [2023-11-16]

### Bugfix

1. [#164](https://github.com/InfluxCommunity/influxdb3-js/issues/164): Query infinite wait state

## 0.4.0 [2023-11-03]

### Features

1. [#157](https://github.com/InfluxCommunity/influxdb3-js/pull/157): Add client instantiation from connection string and environment variables

## 0.3.1 [2023-10-06]

Fixed package distribution files. The distribution files were not being included in the npm package.

## 0.3.0 [2023-10-02]

### Features

1. [#89](https://github.com/InfluxCommunity/influxdb3-js/pull/89): Add structured query support

### Docs

1. [#89](https://github.com/InfluxCommunity/influxdb3-js/pull/89): Add downsampling example

## 0.2.0 [2023-08-11]

### Features

1. [#52](https://github.com/InfluxCommunity/influxdb3-js/pull/52): Add support for browser environment

### Docs

1. [#52](https://github.com/InfluxCommunity/influxdb3-js/pull/52): Improve examples

## 0.1.0 [2023-06-29]

- initial release of new client version
- write using v2 api
- query using FlightSQL
- query using InfluxQl
