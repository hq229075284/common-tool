// import { test,expect } from 'ts-jest'
import getAxisMaxAndMin from '../src/getAxisMaxAndMin.ts'
// const {getAxisMaxAndMin} =require('../package/getAxisMaxAndMin.js')

test('无传参时，计算默认值', () => {
  expect(getAxisMaxAndMin()).toEqual({
    max: 14.2,
    min: -2.5,
    interval: 3.34,
  })
})

test('最大、最小值相同时，计算', () => {
  expect(getAxisMaxAndMin({ min: 100, max: 100 })).toEqual({
    max: 100.07,
    min: 99.97,
    interval: 0.02,
  })
})

test('最大、最小值同为0时，计算', () => {
  expect(getAxisMaxAndMin({ min: 0, max: 0, zeroIsMin: true })).toEqual({
    max: 0.1,
    min: 0,
    interval: 0.02,
  })
})

test('当负数是最小值时', () => {
  expect(getAxisMaxAndMin({ min: 0, max: 0 })).toEqual({
    max: 0.07,
    min: -0.03,
    interval: 0.02,
  })
})

test('当计算出来的最小值，不是最小单位长度的整数倍时，需要向下调整最小值', () => {
  expect(getAxisMaxAndMin({ min: 4.24, max: 40.24, fixedLength: 1 })).toEqual({
    max: 106.7,
    min: -13.8,
    interval: 24.1,
  })
})

test('最大、最小值相同时，该值不是最小单位长度的整数倍', () => {
  expect(() => getAxisMaxAndMin({ min: 100.001, max: 100.001 })).toThrow(Error)
})

test('最小值介于0和负的最小间隔之间时，最小值应该是负数，不是0', () => {
  expect(
    getAxisMaxAndMin({
      diffRange: 1,
      fixedLength: 1,
      showRatio: 1,
      min: -0.01,
      max: 5,
    })
  ).toEqual({
    max: 5.4,
    min: -0.1,
    interval: 1.1,
  })
})

test('计算interval', () => {
  expect(
    getAxisMaxAndMin({
      max: 313,
      min: 0,
      splitNumber: 8,
      diffRange: 0.8,
      fixedLength: 0,
      showRatio: 0.8,
      zeroIsMin: true,
    })
  ).toEqual({
    max: 448,
    min: 0,
    interval: 56,
  })
})

test('multiply测试', () => {
  expect(
    getAxisMaxAndMin({
      max: 0,
      min: 0,
      splitNumber: 3,
      diffRange: 1,
      fixedLength: 1,
      showRatio: 0.8,
    })
  ).toEqual({
    max: 0.9,
    min: -0.6,
    interval: 0.5,
  })
})
