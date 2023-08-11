import {defineConfig} from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/influx': {
        target: 'http://localhost:10000/', // envoy proxy address
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/influx/, ''),
      },
    },
  },
})
