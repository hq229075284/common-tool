// 合并preset
// https://stackoverflow.com/a/52622141
const merge = require('lodash/merge')
const ts_preset = require('ts-jest/presets/js-with-ts/jest-preset')
const puppeteer_preset = require('jest-puppeteer/jest-preset')

module.exports = merge(ts_preset, puppeteer_preset, {
  globals: {
    // test_url: `http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 3000}`,
    'ts-jest': {
      // 指定tsconfig，让ts-jest可以处理js文件
      tsconfig: '<rootDir>/tsconfig.base.json',
    },
  },
})
