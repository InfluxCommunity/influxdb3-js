<p align="center">
    <img src="js_logo.png" alt="JavaScript Logo" width="150px">
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@influxdata/influxdb3-client">
        <img src="https://img.shields.io/npm/v/@influxdata/influxdb3-client" alt="NuGet Badge">
    </a>
    <a href="https://github.com/bonitoo-io/influxdb3-js/actions/workflows/codeql-analysis.yml">
        <img src="https://github.com/bonitoo-io/influxdb3-js/actions/workflows/codeql-analysis.yml/badge.svg?branch=main" alt="CodeQL analysis">
    </a>
    <a href="https://github.com/bonitoo-io/influxdb3-js/actions/workflows/linter.yml">
        <img src="https://github.com/bonitoo-io/influxdb3-js/actions/workflows/linter.yml/badge.svg" alt="Lint Code Base">
    </a>
    <a href="https://dl.circleci.com/status-badge/redirect/gh/bonitoo-io/influxdb3-js/tree/main">
        <img src="https://dl.circleci.com/status-badge/img/gh/bonitoo-io/influxdb3-js/tree/main.svg?style=svg" alt="CircleCI">
    </a>
    <a href="https://codecov.io/gh/bonitoo-io/influxdb3-js">
        <img src="https://codecov.io/gh/bonitoo-io/influxdb3-js/branch/main/graph/badge.svg" alt="Code Cov"/>
    </a>
    <a href="https://app.slack.com/huddle/TH8RGQX5Z/C02UDUPLQKA">
        <img src="https://img.shields.io/badge/slack-join_chat-white.svg?logo=slack&style=social" alt="Community Slack">
    </a>
</p>

# InfluxDB 3 JavaScript Client

The JavaScript Client that provides a simple and convenient way to interact with InfluxDB 3.
This package supports both writing data to InfluxDB and querying data using the FlightSQL client,
which allows you to execute SQL queries against InfluxDB IOx.

## Installation

To write or query InfluxDB 3, add `@influxdata/influxdb3-client` as a dependency to your project using your favorite package manager.

```sh
npm install --save @influxdata/influxdb3-client
yarn add @influxdata/influxdb3-client
pnpm add @influxdata/influxdb3-client
```

If you target Node.js, use [@influxdata/influxdb3-client](./packages/client/README.md).
It provides main (CJS), module (ESM), and browser (UMD) exports.

If you target browsers (including [Deno](https://deno.land/) and [Ionic](https://ionic.io/)), use [@influxdata/influxdb3-client-browser](./packages/client-browser/README.md) in place of `@influxdata/influxdb3-client`. It provides main (UMD) and module (ESM) exports.

## Usage

To start with the client, import the `InfluxDB` type and create a `InfluxDB` by constructor initializer:

```javascript
import {InfluxDB} from '@influxdata/influxdb3-client/src'

let url = 'https://eu-central-1-1.aws.cloud2.influxdata.com/';
let database = 'my-database';
let token = 'my-token';

let client = new InfluxDB({url: url, database: database, token: token});
```

to insert data, you can use code like this:

```javascript
// TBD
```

to query your data, you can use code like this:

```javascript
// TBD
```

## Feedback

If you need help, please use our [Community Slack](https://app.slack.com/huddle/TH8RGQX5Z/C02UDUPLQKA)
or [Community Page](https://community.influxdata.com/).

New features and bugs can be reported on GitHub: <https://github.com/bonitoo-io/influxdb3-js>

## Contribution

If you would like to contribute code you can do through GitHub by forking the repository and sending a pull request into
the `main` branch.

## License

The InfluxDB 3 JavaScript Client is released under the [MIT License](https://opensource.org/licenses/MIT).
