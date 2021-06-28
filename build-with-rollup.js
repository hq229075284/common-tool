const { rollup } = require('rollup')
const path = require('path')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjsPlugin = require('@rollup/plugin-commonjs')
const typescriptPlugin = require('@rollup/plugin-typescript')
const { terser } = require('rollup-plugin-terser')
// const fs = require('fs')

const sourceDir = path.join(__dirname, './src')
// const targets = fs
//   .readdirSync(sourceDir)
//   .reduce((prev, name) => {
//     if (fs.statSync(path.join(sourceDir, name)).isDirectory()) {
//       prev.push(`${name}${path.sep}index.ts`)
//     } else {
//       // prev.push(name)
//     }
//     return prev
//   }, [])
//   .map((name) => path.join(sourceDir, name))

const targets = [path.join(sourceDir, 'index.ts')]

async function run(targetPath) {
  const inputOptions = {
    input: targetPath,
    external(id, pid, isResolved) {
      // console.log(id, pid, isResolved)
      return ['axios'].includes(id)
    },
    plugins: [
      typescriptPlugin({
        // https://github.com/rollup/plugins/issues/394#issuecomment-762742366
        tsconfig: './tsconfig.json',
      }),
      nodeResolve(),
      commonjsPlugin(),
      // terser({}),
    ],
  }
  const outputOptions = {
    // file: targetPath.replace(/([\\\/])[\w.]+$/, ($0, $1) => `${$1}dist.js`),
    // file: targetPath.split(/\\|\//).slice(-2)[0],
    dir: path.join(__dirname, 'dist'),
    format: 'esm',
  }
  const bundle = await rollup(inputOptions)
  await bundle.write(outputOptions)
}

;(async function () {
  for (let i = 0; i < targets.length; i++) {
    await run(targets[i])
  }
})()
