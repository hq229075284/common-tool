/**
 * @jest-environment jsdom
 */

import { AliveDetection, EXPIRE } from '../src/aliveDetection'

test('未检测信息过期前移除', (done) => {
  const listener = jest.fn()
  const detection = new AliveDetection()
  detection.set('test', { x: 1 }, Date.now() + 2 * 1000)
  setTimeout(() => {
    detection.remove('test')
  }, 1000)
  detection.on('test', (args) => {
    if (args.type === EXPIRE) {
      listener()
    }
  })
  setTimeout(() => {
    expect(listener).not.toHaveBeenCalled()
    done()
  }, 3000)
})

test('检测信息过期', (done) => {
  const listener = jest.fn()
  const detection = new AliveDetection()
  detection.set('test', { x: 1 }, Date.now() + 2 * 1000)
  detection.on('test', (args) => {
    if (args.type === EXPIRE) {
      listener()
    }
  })
  setTimeout(() => {
    expect(listener).toHaveBeenCalled()
    done()
  }, 3000)
})

test('检测信息重复', (done) => {
  let count = 0
  const listener = () => count++
  const detection = new AliveDetection()
  detection.on('test', (args) => {
    if (args.type === EXPIRE) {
      listener()
    }
  })
  const expireTime = Date.now() + 2 * 1000
  detection.set('test', { x: 1 }, expireTime)
  setTimeout(() => {
    detection.set('test', { x: 2 }, expireTime)
  }, 500)

  setTimeout(() => {
    expect(count).toBe(1)
    done()
  }, 3000)
})
