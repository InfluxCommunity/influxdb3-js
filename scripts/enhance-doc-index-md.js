/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const marker = '<!-- enhanced with enhance-doc-index.md.js -->'
const version = require('../lerna.json').version

function enhanceIndexMD(file) {
  const data = fs.readFileSync(file, 'utf8')
  const lines = data.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('<!--')) {
      if (lines[i].startsWith(marker)) {
        console.log(
          `skipped: ${file} - nothing to do, the file was already processed`
        )
      }
      continue
    }
    break
  }
  console.log(`enhance: ${file}`)
  const newLines = lines.reduce(
    (acc, line) => {
      acc.push(line)
      if (line.startsWith('## API Reference')) {
        acc.push('')
        acc.push(
          `Welcome to the API Reference Documentation of InfluxDB 3 JavaScript Client (version ${version} _${new Date().toISOString()}_).`
        )
        acc.push('Use this client library with InfluxDB 3.')
        acc.push(
          'For connecting to InfluxDB 1.8 or 2 instances, see the [influxdb-client-js](https://github.com/influxdata/influxdb-client-js) client library.'
        )
        acc.push(
          'For connecting to InfluxDB 1.7 or earlier instances, see the [node-influx](https://github.com/node-influx/node-influx) client library.'
        )
      }
      return acc
    },
    [marker]
  )

  fs.writeFileSync(file, newLines.join('\n'), 'utf8')
}

const indexMD = path.resolve(__dirname, '..', 'docs', 'dist', 'index.md')
enhanceIndexMD(indexMD)
