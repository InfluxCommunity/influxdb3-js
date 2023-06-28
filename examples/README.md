## Examples

## Basic

- [IOxExample](examples/src/main.ts) - How to use write and query data from InfluxDB IOx

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

### powershell

```powershell
$env:INFLUXDB_URL="<url>"
$env:INFLUXDB_DATABASE="<database>"
$env:INFLUXDB_TOKEN="<token>"
```

### cmd

```console
set INFLUXDB_URL=<url>
set INFLUXDB_DATABASE=<database>
set INFLUXDB_TOKEN=<token>
```

</details>

- run `yarn install`
- run `yarn dev`
