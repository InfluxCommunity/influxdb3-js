<p align="center">
    <img src="https://raw.githubusercontent.com/InfluxCommunity/influxdb3-js/HEAD/js_logo.png" alt="JavaScript Logo" width="150px">
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@influxdata/influxdb3-client">
        <img src="https://img.shields.io/npm/v/@influxdata/influxdb3-client" alt="NuGet Badge">
    </a>
    <a href="https://github.com/InfluxCommunity/influxdb3-js/actions/workflows/codeql-analysis.yml">
        <img src="https://github.com/InfluxCommunity/influxdb3-js/actions/workflows/codeql-analysis.yml/badge.svg?branch=main" alt="CodeQL analysis">
    </a>
    <a href="https://github.com/InfluxCommunity/influxdb3-js/actions/workflows/linter.yml">
        <img src="https://github.com/InfluxCommunity/influxdb3-js/actions/workflows/linter.yml/badge.svg" alt="Lint Code Base">
    </a>
    <a href="https://dl.circleci.com/status-badge/redirect/gh/InfluxCommunity/influxdb3-js/tree/main">
        <img src="https://dl.circleci.com/status-badge/img/gh/InfluxCommunity/influxdb3-js/tree/main.svg?style=svg" alt="CircleCI">
    </a>
    <a href="https://codecov.io/gh/InfluxCommunity/influxdb3-js">
        <img src="https://codecov.io/gh/InfluxCommunity/influxdb3-js/branch/main/graph/badge.svg" alt="Code Cov"/>
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

## Usage

Set environment variables:

- `INFLUX_HOST` - InfluxDB address, eg. *`https://us-east-1-1.aws.cloud2.influxdata.com/`*
- `INFLUX_TOKEN` - access token
- `INFLUX_DATABASE` - database (bucket) name, eg. *`my-database`*

<details>
  <summary>linux/macos</summary>

```sh
export INFLUX_HOST="<url>"
export INFLUX_DATABASE="<database>"
export INFLUX_TOKEN="<token>"
```

</details>

<details>
  <summary>windows</summary>

### powershell

```powershell
$env:INFLUX_HOST = "<url>"
$env:INFLUX_DATABASE = "<database>"
$env:INFLUX_TOKEN = "<token>"
```

### cmd

```console
set INFLUX_HOST=<url>
set INFLUX_DATABASE=<database>
set INFLUX_TOKEN=<token>
```

</details>

### Create a client

To get started with influxdb client import `@influxdata/influxdb3-client` package.

```ts
import {InfluxDBClient, Point} from '@influxdata/influxdb3-client'
```

Assign values for environment variables, and then instantiate `InfluxDBClient` inside of an asynchronous function.
Please note that token is a mandatory parameter.
Make sure to `close` the client when it's no longer needed for writing or querying.

```ts
const host = process.env.INFLUX_HOST
const token = process.env.INFLUX_TOKEN
const database = process.env.INFLUX_DATABASE

async function main() {
    const client = new InfluxDBClient({host, token, database})

    // code goes here

    client.close()
}

main()
```

You can also use a provided no argument constructor for `InfluxDBClient` instantiation using environment variables:

```ts

async function main() {
    const client = new InfluxDBClient()

    // code goes here

    client.close()
}

main()
```

You can also instantiate `InfluxDBClient` with a connection string:

```ts

async function main() {
    const client = new InfluxDBClient('https://us-east-1-1.aws.cloud2.influxdata.com/?token=my-token&database=my-database')

    // code goes here

    client.close()
}

main()
```

### Write data

To write data to InfluxDB, call `client.write` with data in [line-protocol](https://docs.influxdata.com/influxdb/cloud-serverless/reference/syntax/line-protocol/) format and the database (or bucket) name.

```ts
const line = `stat,unit=temperature avg=20.5,max=45.0`
await client.write(line, database)
```

### Query data

To query data stored in InfluxDB, call `client.query` with an SQL query and the database (or bucket) name. To change to using InfluxQL add a QueryOptions object with the type 'influxql' (e.g. `client.query(query, database, { type: 'influxql'})`).

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

or use a typesafe `PointValues` structure with `client.queryPoints`

```ts
const queryPointsResult = client.queryPoints(
    query,
    database,
    queryOptions
)

for await (const row of queryPointsResult) {
    console.log(`avg is ${row.getField('avg', 'float')}`)
    console.log(`max is ${row.getField('max', 'float')}`)
    console.log(`lp: ${row.asPoint('stat').toLineProtocol()}`)
}
```

## Examples

For more advanced usage, see [examples](https://github.com/InfluxCommunity/influxdb3-js/blob/HEAD/examples/README.md).

## Feedback

If you need help, please use our [Community Slack](https://app.slack.com/huddle/TH8RGQX5Z/C02UDUPLQKA)
or [Community Page](https://community.influxdata.com/).

New features and bugs can be reported on GitHub: <https://github.com/InfluxCommunity/influxdb3-js>

## Contribution

To contribute to this project, fork the GitHub repository and send a pull request based on the `main` branch.

## Development

### Update the Flight Client

For now, we're responsible for generating the Flight client. However, its Protobuf interfaces may undergo changes over time.

To regenerate the Flight client, use the `yarn flight` command to execute the provided script. The script will clone the Flight Protobuf repository and generate new TypeScript files in `./src/generated/flight`.

### Generate files for mock server

To generate files needed for the mock server used in some tests, run the `yarn flight:test` command.

## License

The InfluxDB 3 JavaScript Client is released under the [MIT License](https://opensource.org/licenses/MIT).
