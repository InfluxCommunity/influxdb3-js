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

const packageJsonContent = {
  scripts: {
    protoc: 'protoc',
    'generate-protoc': `npx protoc --ts_out ./${OUTPUT_DIR}/ --ts_opt optimize_code_size --proto_path . *.proto`,
  },
  dependencies: {
    '@protobuf-ts/plugin': '^2.9.0',
  },
  license: 'MIT',
}

const drawProgressBar = (current, total, message) => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(
    `[${'▇'.repeat(current).padEnd(total)}]: ${message.padEnd(60)}`
  )
}

process.stdout.write('Generating flight client...\n')
const TOTAL_STEPS = 10
let stepI = 0
const step = (name) => {
  if (process.env.CIRCLECI) {
    process.stdout.write(
      `${stepI.toString().padStart(2)}/${TOTAL_STEPS}: ${name}\n`
    )
  } else {
    drawProgressBar(stepI, TOTAL_STEPS, name)
  }
  stepI++
}

step('Setting up working directory')
fs.rmSync(FLIGHTGEN_DIR, {recursive: true, force: true})
fs.mkdirSync(FLIGHTGEN_DIR)
process.chdir(FLIGHTGEN_DIR)
// ./flightgen

step('Cloning Arrow repository')
execSync(`git clone -n --depth 1 ${ARROW_REPOSITORY} arrow`, {stdio: []})
process.chdir('arrow')
// ./flightgen/arrow

step('Checking out Arrow protocol files')
execSync(`git checkout main ${FLIGHT_PROTO_PATH}`, {stdio: []})
fs.copyFileSync(FLIGHT_PROTO_PATH, `../${FLIGHT_PROTO_NAME}`)

process.chdir('..')
// ./flightgen

step('Cleaning up cloned Arrow repository')
fs.rmSync('arrow', {recursive: true, force: true})

step('Creating package.json for dependencies')
fs.writeFileSync('package.json', JSON.stringify(packageJsonContent, null, 2))

step('Installing necessary Node dependencies')
fs.mkdirSync(OUTPUT_DIR, {recursive: true})
execSync('yarn install', {stdio: []})

step('Generating TypeScript files from proto files')
execSync('yarn generate-protoc', {stdio: []})

process.chdir('..')
// ./

step('Copying generated files to client implementation')
fs.rmSync(CLIENT_GENERATED_FLIGHT_DIR, {recursive: true, force: true})

fs.mkdirSync(CLIENT_GENERATED_FLIGHT_DIR, {recursive: true})

function copyDirRecursively(srcDir, destDir) {
  fs.readdirSync(`${srcDir}`).forEach((file) => {
    if (fs.statSync(`${srcDir}/${file}`).isDirectory()) {
      if (!fs.existsSync(`${destDir}/${file}`)) {
        fs.mkdirSync(`${destDir}/${file}`, {recursive: true});
        copyDirRecursively(`${srcDir}/${file}`, `${destDir}/${file}`)
      }
    } else {
      const destinationFile = `${destDir}/${file}`;
      fs.copyFileSync(
          `${srcDir}/${file}`,
          destinationFile
      )
      step(`Correcting BigInt initialization syntax: ${destinationFile}`)
      const fixed = fs.readFileSync(destinationFile, 'utf8').replace(/ 0n/g, ' BigInt(0)')
      fs.writeFileSync(destinationFile, fixed, 'utf8')
    }
  })
}

copyDirRecursively(`${FLIGHTGEN_DIR}/${OUTPUT_DIR}`, `${CLIENT_GENERATED_FLIGHT_DIR}`)

step('Final cleanup of temporary working directory')
fs.rmSync(FLIGHTGEN_DIR, {recursive: true, force: true})

step('Done!')
process.stdout.write('\n')
