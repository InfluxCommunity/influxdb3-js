import {defineConfig} from 'tsup'
import {esbuildGzipOutJsPlugin} from '../../scripts/esbuild-gzip-js'
import {readFile} from 'fs/promises'
import pkg from './package.json'

const minify = !(process.env.ESBUILD_MINIFY === '0')

const outFiles = {
  esm: pkg.exports['.'].browser.import,
  cjs: pkg.exports['.'].browser.require,
  iife: pkg.exports['.'].browser.script,
}

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  format: ['cjs', 'esm', 'iife'],
  globalName: 'influxdb',
  dts: false,
  minify,
  target: ['es2018'],
  platform: 'browser',
  splitting: false,
  define: {
    'process.env.BUILD_BROWSER': 'true',
  },
  esbuildOptions(options, {format}) {
    options.outdir = undefined
    options.outfile = outFiles[format]
    if (format === 'cjs') {
      // esbuild does not generate UMD format OOTB, see https://github.com/evanw/esbuild/issues/507
      // the following code is a trick to generate UMD output in place of cjs
      options.format = 'iife'
      options.banner = {
        js: `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@influxdata/influxdb-client"] = {}));
})(this, (function (exports) {`,
      }
      options.footer = {
        js: `Object.defineProperty(exports, '__esModule', { value: true });Object.assign(exports, ${options.globalName});}));`,
      }
    }
  },
  esbuildPlugins: [
    esbuildGzipOutJsPlugin,
    {
      name: 'replaceTransportImport',
      setup: (build) => {
        build.onLoad({filter: /implSelector.ts$/}, async (args) => {
          const source = await readFile(args.path, 'utf8')
          const contents = (source as unknown as string).replace(
            // replace all, ./node appears in comment too
            /.\/node/g,
            './browser'
          )
          return {
            contents,
            loader: 'ts',
          }
        })
      },
    },
  ],
})
