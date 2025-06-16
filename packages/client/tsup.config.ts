import {defineConfig} from 'tsup'
import {esbuildGzipOutJsPlugin} from '../../scripts/esbuild-gzip-js'
import pkg from './package.json'

const minify = !(process.env.ESBUILD_MINIFY === '0')

const outFiles = {
  esm: pkg.exports['.'].import,
  cjs: pkg.exports['.'].require,
}

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify,
  target: ['es2018'],
  platform: 'node',
  splitting: false,
  esbuildOptions(options, {format}) {
    options.outdir = undefined
    options.outfile = outFiles[format]
  },
  esbuildPlugins: [
      esbuildGzipOutJsPlugin,
    {
      name: "rewrite-native-import",
      setup(build) {
        build.onResolve({ filter: /^.*\/native$/ }, (args) => {
          // Rewrite the import path to point to "./native"
          // and mark it as external so it's not bundled.
          return { path: "./native", external: true };
        });
      },
    },
  ],
})
