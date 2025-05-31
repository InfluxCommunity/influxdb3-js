
# Influxdb3 js client with rust backend TODO
## Overview
 Core inspiration: https://github.com/roeap/flight-sql-client-node
 Nice example of napi package: https://github.com/rollup/rollup 

## CI
- Add building of the rust client for all supported tripplets
- Add publishing of the rust client for all supported tripplets


## Rust
 - Use regular Get GRPC request, like it is done in original client (now in browser implementation) to query data, not prepared statements
 - Propagate errors from rust to js


## JS
Note, that only linux-x64-gnu and win32-x64-msvc are precompiled and published at the moment under the @vlastahajek NPM name.
native.js was manually modified to include the correct package name.
building rust client will rewrite the native.js to include the correct package name.

After building and publishing the rust client for supported platform, we need to change the package.json to include the correct packages:

```json
  "optionalDependencies": {
    "@influxdata/influxdb3-js-flight-sql-client-android-arm-eabi": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-android-arm64": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-darwin-arm64": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-darwin-x64": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-freebsd-x64": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-linux-arm-gnueabihf": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-linux-arm64-gnu": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-linux-arm64-musl": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-linux-x64-gnu": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-linux-x64-musl": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-win32-ia32-msvc": "0.0.1",
    "@influxdata/influxdb3-js-flight-sql-client-win32-x64-msvc": "0.0.1"
  }
```

