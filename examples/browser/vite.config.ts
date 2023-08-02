import {defineConfig} from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/influx': {
        target: process.env.INFLUXDB_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/influx/, ''),
      },
    },
  },
})
