// multiplatform copy command
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

function copyFiles(source, destination) {
  const sourcePath = path.resolve(source)
  const destinationPath = path.resolve(destination)

  if (fs.existsSync(sourcePath)) {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destinationPath, {recursive: true})
      const files = fs.readdirSync(sourcePath)

      files.forEach((file) => {
        const srcFile = path.join(sourcePath, file)
        const destFile = path.join(destinationPath, file)
        copyFiles(srcFile, destFile)
      })
    } else {
      fs.copyFileSync(sourcePath, destinationPath)
    }
  }
}

const sourceDir = process.argv[2]
const destinationDir = process.argv[3]

copyFiles(sourceDir, destinationDir)
