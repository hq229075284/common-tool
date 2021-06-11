const { rollup } = require('rollup')
const path = require('path')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjsPlugin = require('@rollup/plugin-commonjs')
const typescriptPlugin = require('@rollup/plugin-typescript')

const targets = [
  path.join(__dirname, './ajax/custom.ts'),
  // path.join(__dirname, './cache/index.ts')
]

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
    ],
  }
  const outputOptions = {
    file: targetPath.replace(/([\\\/])[\w.]+$/, ($0, $1) => `${$1}dist.js`),
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
