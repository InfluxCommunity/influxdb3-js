## Example for danfojs

- [IOx with danfojs example](./src/index.ts) - How to use InfluxDB IOx queried data with danfojs

## prerequisites
  - `node` and `yarn` installed
  - build influxdb-client: *(in project root directory)*
    - run `yarn install`
    - run `yarn build`

## Usage

set environment variables.

- `INFLUXDB_URL` region of your influxdb cloud e.g. *`https://us-east-1-1.aws.cloud2.influxdata.com/`*
- `INFLUXDB_TOKEN` read/write token generated in cloud
- `INFLUXDB_DATABASE` name of database e.g .*`my-database`*

For simplicity you can use dotenv library to load environment variables in this example. Create `.env` file and paste your variables as follows:

```conf
INFLUXDB_URL="<url>"
INFLUXDB_DATABASE="<database>"
INFLUXDB_TOKEN="<token>"
```

### Run example
- run `yarn install`
- run `yarn dev`
