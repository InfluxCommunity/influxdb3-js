
TODO README:

prerequisites
  node
  yarn
  docker


pass your environment variables into browser through vite dotenv.

create file named `.env.local`, replace database and token:

```conf
VITE_INFLUXDB_DATABASE=<database>
VITE_INFLUXDB_TOKEN=<token>
```

run `docker compose up`

run `yarn dev`


