import DcResizeObserver from '../src/DcResizeObserver'

// function DcResizeObserver() {}

beforeAll(async () => {
  await page.goto('http://127.0.0.1:8080/p.html')
})

test('监听容器变化', async () => {
  // https://pptr.dev/api/puppeteer.page.exposefunction#example-1
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
