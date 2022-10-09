import { getItem } from '../src/loadAny/load'
import { registry } from '../src/loadAny/registry'

test(
  'load',
  async () => {
    const originData = { log: 'this is module a' }
    setTimeout(() => {
      registry('a', originData)
    }, 2000)
    const data = await getItem('a')
    expect(data).toBe(originData)

    const startTime = Date.now()
    await getItem('a')
    expect(Date.now() - startTime).toBeLessThan(3000)
  },
  6 * 1000
)
