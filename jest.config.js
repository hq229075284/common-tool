/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: './jest-preset.js',
  // preset: 'jest-puppeteer',
  // preset: 'ts-jest/presets/js-with-ts',
  // testEnvironment: 'node',
  testRegex: [
    // 'loadAny\\.test\\.js',
    // 'crypto\\.test\\.js',
    'DcResizeObserver\\.test\\.js',
    // 'getAxisMaxAndMin\\.test\\.js',
    // 'loop\\.test\\.js',
    // 'traverseEveryProperty\\.test\\.js',
    // 'workflow\\.test\\.js',
    // placeholder
  ],
}
