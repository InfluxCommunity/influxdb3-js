/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFLUXDB_DATABASE: string
  readonly VITE_INFLUXDB_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
