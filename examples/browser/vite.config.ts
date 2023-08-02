import {defineConfig} from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/influx': {
        target: process.env.INFLUXDB_URL,
        // target: "http://localhost:10000/", // for web gRPC with envoy proxy
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/influx/, ''),
      },
    },
  },
})
