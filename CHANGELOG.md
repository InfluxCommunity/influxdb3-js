## 0.10.0 [unreleased]

### Features

1. [369](https://github.com/InfluxCommunity/influxdb3-js/pull/369): Propagates headers from HTTP response to HttpError when an error is returned from the server.
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
