import DcResizeObserver from '../../src/DcResizeObserver'

// function DcResizeObserver() {}

beforeAll(async () => {
  await page.goto('https://www.freehan.ml/test.html')
})

test('监听容器变化', async () => {
  // https://pptr.dev/api/puppeteer.page.exposefunction#example-1
  // https://pptr.dev/api/puppeteer.pageeventobject/
  page.on('console', (msg) => console.log(msg.text()))
  const trigger = await page.evaluate((DcResizeObserverStr) => {
    const ob = new Function(DcResizeObserverStr + '\nreturn new DcResizeObserver()')()

    const target = document.querySelector('.target')

    let _resolve = null

    target.style.width = '200px'
    target.style.height = '100px'

    function cb(entry) {
      const { blockSize: height, inlineSize: width } = entry.borderBoxSize[0]
      _resolve(width === 400 && height === 200)
    }

    ob.observe(target, cb)

    setTimeout(() => {
      target.style.width = '400px'
      target.style.height = '200px'

      // console.log(target.parentNode.innerHTML)
    }, 1000)

    return new Promise((resolve) => {
      _resolve = resolve
    })
  }, DcResizeObserver.toString())

  expect(trigger).toBe(true)
})

test('初始时监听不可见元素，当该元素可见时会执行回调', async () => {
  // https://pptr.dev/api/puppeteer.page.exposefunction#example-1
  // https://pptr.dev/api/puppeteer.pageeventobject/
  page.on('console', (msg) => console.log(msg.text()))
  const trigger = await page.evaluate((DcResizeObserverStr) => {
    const ob = new Function(DcResizeObserverStr + '\nreturn new DcResizeObserver()')()

    const target = document.querySelector('.target')
    target.style.width = '200px'
    target.style.height = '100px'
    target.style.display = 'none'

    let _resolve = null

    function cb(entry) {
      const { blockSize: height, inlineSize: width } = entry.borderBoxSize[0]
      _resolve(width === 200 && height === 100)
    }

    ob.observe(target, cb)

    setTimeout(() => {
      target.style.display = 'block'
    }, 1000)

    return new Promise((resolve) => {
      _resolve = resolve
    })
  }, DcResizeObserver.toString())

  expect(trigger).toBe(true)
})
