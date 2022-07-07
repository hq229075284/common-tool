/**
 * @jest-environment jsdom
 */
import Loop, { STOP } from '../src/loop'

// https://jestjs.io/docs/jest-object#jestsettimeouttimeout
jest.setTimeout(10 * 1000) // 设置每个测试用例运行时间不能超过10s

test('每隔1秒执行一次，共执行2次', (done) => {
  const interval = 1000
  const startTimeStamp = Date.now()
  let time = 2
  const instance = new Loop(
    () => {
      time--
      if (!time) {
        expect(startTimeStamp + time * interval).toBeLessThanOrEqual(Date.now())
        done()
      }
    },
    { interval }
  )
})

test('执行hooksBeforeRun', (done) => {
  const interval = 1000
  let ranHook = false
  const instance = new Loop(
    () => {
      expect(ranHook).not.toBeFalsy()
      done()
    },
    {
      hooksBeforeRun: [
        (_done) => {
          ranHook = true
          _done()
        },
      ],
      interval,
    }
  )
})

test('开始时run一次', (done) => {
  const startTimeStamp = Date.now()
  const interval = 1000
  const instance = new Loop(
    () => {
      // console.log('now', Date.now())
      // console.log('startTimeStamp',startTimeStamp)
      // console.log('startTimeStamp+interval',startTimeStamp+interval)
      expect(Date.now()).toBeLessThanOrEqual(startTimeStamp + interval)
      done()
      // 不结束循环调用，此test suit会再次执行到expect（此行为要做更多研究，不确定是bug还是使用问题）
      return Promise.reject(STOP)
    },
    { leading: true, interval }
  )
})

test('在timeout计时时，取消run', (done) => {
  const interval = 1000
  const startTimeStamp = Date.now()
  const instance = new Loop(
    () => {
      expect(startTimeStamp + interval + 500).toBeLessThanOrEqual(Date.now())
      done()
    },
    { interval }
  )
  setTimeout(() => {
    instance.reset()
  }, 500)
})

test('在hooksBeforeRun进行时，取消run', (done) => {
  const startTimeStamp = Date.now()
  const interval = 1000
  const hookDelay = 2000
  const resetDelay = 2000
  const instance = new Loop(
    () => {
      expect(startTimeStamp + (interval + (resetDelay - interval)) + (interval + hookDelay)).toBeLessThanOrEqual(Date.now())
      done()
    },
    {
      interval: interval,
      hooksBeforeRun: [
        (done) => {
          setTimeout(done, hookDelay)
        },
      ],
    }
  )
  setTimeout(() => {
    instance.reset()
  }, resetDelay)
})
