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

** ⚠️ The browser target is not currently supported.**.

## Usage

set environment variables:

- `INFLUXDB_URL` region of your influxdb cloud e.g. *`https://us-east-1-1.aws.cloud2.influxdata.com/`*
- `INFLUXDB_TOKEN` read/write token generated in cloud
- `INFLUXDB_DATABASE` name of database e.g .*`my-database`*

<details>
  <summary>linux/macos</summary>

```sh
export INFLUXDB_URL="<url>"
export INFLUXDB_DATABASE="<database>"
export INFLUXDB_TOKEN="<token>"
```

</details>

<details>
  <summary>windows</summary>

```powershell
setx INFLUXDB_URL "<url>"
setx INFLUXDB_DATABASE "<database>"
setx INFLUXDB_TOKEN "<token>"
```

</details>

To get started with influxdb client import `@influxdata/influxdb3-client` package.

```ts
import {InfluxDBClient, Point} from '@influxdata/influxdb3-client'
```

Prepare environmnet variables and instanciate `InfluxDBClient` in asynchronous function. Make sure to `close` client after.

```ts
const url = process.env.INFLUXDB_URL
const token = process.env.INFLUXDB_TOKEN
const database = process.env.INFLUXDB_DATABASE

async function main() {
    const client = new InfluxDBClient({url, token})

    // following code goes here

    client.close()
}

main()
```

The `client` can be now used to insert data using [line-protocol](https://docs.influxdata.com/influxdb/cloud-serverless/reference/syntax/line-protocol/):

```ts
const line = `stat,unit=temperature avg=20.5,max=45.0`
await client.write(line, database)
```

Fetch data using `SQL` query and print result.

```ts
// Execute query
const query = `
    SELECT *
    FROM "stat"
    WHERE
    time >= now() - interval '5 minute'
    AND
    "unit" IN ('temperature')
`
const queryResult = await client.query(query, database)

for await (const row of queryResult) {
    console.log(`avg is ${row.avg}`)
    console.log(`max is ${row.max}`)
}
```

## Example

Prepare environment like in [Usage](#usage) and run `npx ts-node ./packages/client/src/example/main.ts`.

## Feedback

If you need help, please use our [Community Slack](https://app.slack.com/huddle/TH8RGQX5Z/C02UDUPLQKA)
or [Community Page](https://community.influxdata.com/).

New features and bugs can be reported on GitHub: <https://github.com/bonitoo-io/influxdb3-js>

## Contribution

If you would like to contribute code you can do through GitHub by forking the repository and sending a pull request into
the `main` branch.

## Update the Flight Client

As of now, we're responsible for generating the Flight Client by ourself. However, its Protobuf interfaces may undergo changes over time. To re-generate the Flight Client, we have provided a script that can be executed using `yarn flight`. This script will clone the Flight Protobuf repository and generate new TypeScript files into the client.

## License

The InfluxDB 3 JavaScript Client is released under the [MIT License](https://opensource.org/licenses/MIT).
