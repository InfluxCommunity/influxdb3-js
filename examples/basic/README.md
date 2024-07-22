## Basic Example

- [IOxExample](./src/index.ts) - How to use write and query data from InfluxDB IOx
- [IOxRetryExample](./src/writeRetry.ts) - How to use write and then retry if the server returns status `429 - Too many requests` or `503 - Temporarily unavailable`.  

## prerequisites

- `node` and `yarn` installed

- build influxdb-client: *(in project root directory)*
  - run `yarn install`
  - run `yarn build`

## Usage

set environment variables.

- `INFLUX_HOST` region of your influxdb cloud e.g. *`https://us-east-1-1.aws.cloud2.influxdata.com/`*
- `INFLUX_TOKEN` read/write token generated in cloud
- `INFLUX_DATABASE` name of database e.g .*`my-database`*

For simplicity, you can use dotenv library to load environment variables in this example. Create `.env` file and paste your variables as follows:

```conf
INFLUX_HOST="<url>"
INFLUX_DATABASE="<database>"
INFLUX_TOKEN="<token>"
```

### Run examples

#### Basic

- run `yarn install`
- run `yarn dev`

#### Write Retry
 
- run `yarn install`
- run `yarn retry`
