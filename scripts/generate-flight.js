/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const {execSync} = require('child_process')

const ARROW_REPOSITORY = 'https://github.com/apache/arrow.git'
// name of proto in arrow repository
const FLIGHT_PROTO_NAME = 'Flight.proto'
const FLIGHT_PROTO_PATH = `./format/${FLIGHT_PROTO_NAME}`
const FLIGHT_TS_FILE = 'Flight.ts'

// relative to: .
const FLIGHTGEN_DIR = 'flightgen'
const CLIENT_GENERATED_FLIGHT_DIR = './packages/client/src/generated/flight/'
// relative to: FLIGHTGEN_DIR
const OUTPUT_DIR = 'out/flight'

fs.rmSync(FLIGHTGEN_DIR, {recursive: true, force: true})
fs.mkdirSync(FLIGHTGEN_DIR)
process.chdir(FLIGHTGEN_DIR)
// ./flightgen

//
// clone and copy proto file from arrow repo
//
execSync(`git clone -n --depth 1 ${ARROW_REPOSITORY} arrow`)
process.chdir('arrow')
// ./flightgen/arrow

execSync(`git checkout main ${FLIGHT_PROTO_PATH}`)
fs.copyFileSync(FLIGHT_PROTO_PATH, `../${FLIGHT_PROTO_NAME}`)

process.chdir('..')
// ./flightgen

fs.rmSync('arrow', {recursive: true, force: true})

//
// generate files from protoc
//
let packageJsonContent = {
  scripts: {
    protoc: 'protoc',
    'generate-protoc': `npx protoc --ts_out ./${OUTPUT_DIR}/ --ts_opt client_grpc1 *.proto`,
  },
  dependencies: {
    '@protobuf-ts/plugin': '^2.9.0',
    protoc: '^1.1.3',
    'ts-proto': '^1.150.0',
  },
}

fs.writeFileSync('package.json', JSON.stringify(packageJsonContent, null, 2))

fs.mkdirSync(OUTPUT_DIR, {recursive: true})
execSync('yarn install')
execSync('yarn generate-protoc')

// Replace the BigInt initialization notation
const flitghtTsFullPath = `./${OUTPUT_DIR}/${FLIGHT_TS_FILE}`
const flightTsData = fs.readFileSync(flitghtTsFullPath, 'utf8')
const flightTsDataBigInt = flightTsData.replace(/ 0n/g, ' BigInt(0)')
fs.writeFileSync(flitghtTsFullPath, flightTsDataBigInt, 'utf8')

process.chdir('..')
// ./

//
// copy generated files
//
fs.rmSync(CLIENT_GENERATED_FLIGHT_DIR, {recursive: true, force: true})

fs.mkdirSync(CLIENT_GENERATED_FLIGHT_DIR, {recursive: true})
fs.readdirSync(`${FLIGHTGEN_DIR}/${OUTPUT_DIR}`).forEach((file) => {
  fs.copyFileSync(
    `${FLIGHTGEN_DIR}/${OUTPUT_DIR}/${file}`,
    `${CLIENT_GENERATED_FLIGHT_DIR}${file}`
  )
})

//
// cleanup
//
fs.rmSync(FLIGHTGEN_DIR, {recursive: true, force: true})
