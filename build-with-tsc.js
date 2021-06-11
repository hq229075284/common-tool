const path = require('path')
const fs = require('fs')
const shelljs = require('shelljs')
const args = process.argv.slice(2)
const params = {}
for (let i = 0; i < args.length; i += 2) {
  params[args[i].replace('--', '')] = args[i + 1]
}

const TEMP_TSCONFIG_NAME = 'temp_tsconfig.json'
const destination = path.join(__dirname, TEMP_TSCONFIG_NAME)
const tsconfig = require('./tsconfig.json')
tsconfig.include = params.dir ? [`src/${params.dir}/**/*`] : ['src/**/*']
fs.writeFileSync(destination, JSON.stringify(tsconfig, null, 2))

shelljs.exec('npx tsc -p ' + TEMP_TSCONFIG_NAME)
