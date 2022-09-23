/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: './jest-preset.js',
  // preset: 'jest-puppeteer',
  // preset: 'ts-jest/presets/js-with-ts',
  // testEnvironment: 'node',
  testRegex: [
    'getAxisMaxAndMin\\.test\\.js',
    // 'traverseEveryProperty\\.test\\.js',
    // 'DcResizeObserver\\.test\\.js',
    // 'loop\\.test\\.js'
  ],
}
