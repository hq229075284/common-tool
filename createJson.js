const path = require('path')
const fs = require('fs')
const args = process.argv.slice(2)
const params = {}
for (let i = 0; i < args.length; i += 2) {
  params[args[i].replace('--', '')] = args[i + 1]
}
const destination = path.join(__dirname, 'temp_tsconfig.json')
const tsconfig = require('./tsconfig.json')
tsconfig.include = [`${params.dir}/**/*`]

fs.writeFileSync(destination, JSON.stringify(tsconfig, null, 2))

console.log('temp_tsconfig.json')
