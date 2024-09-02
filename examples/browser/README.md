## Example for browser

- [IOx inside browser example](./src/main.ts) - How to use InfluxDB IOx queries in the browser.

It's highly recommended to try [basic example](../basic/README.md) first.

⚠️ The browser is a specific environment that requires an additional proxy component, which transfers our communication into a gRPC-compliant form. For more details about proxy requirements, please refer to the gRPC-Web documentation - [gRPC-Web Protocol](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md).

## prerequisites

- To run this example, you'll need to have `Docker` installed alongside **Node** and **Yarn**. Check your installation with `docker --version` command.

- build influxdb-client: *(in project root directory)*
  - run `yarn install`
  - run `yarn build`

## Usage

To inject connection variables, we will use Vite's dotenv environment variables, which can pass our values into the browser.

To get started, create a `.env.local` file and update the database and token values as follows:

```conf
VITE_INFLUXDB_DATABASE=<database>
VITE_INFLUXDB_TOKEN=<token>
```

Open the `envoy.yaml` file and find the `address: "us-east-1-1.aws.cloud2.influxdata.com"` entry. Make sure to update it with your relevant cloud URL, if it differs.

### Run example

- Start docker with envoy proxy
  - run `docker compose up`
- Execute example:
  - run `yarn install` (in this directory)
  - run `yarn dev`
- Example is running at `http://localhost:5173/` *(note that port can differes, look into console for exact address)*
