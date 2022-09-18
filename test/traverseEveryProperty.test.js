import traverse from "../src/traverseEveryProperty";

test('scale变换', () => {
  const source = {
    title: {
      text: 'Stacked Line'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
    },
    grid: {
      left: 30,
      right: 30,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Email',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210]
      }
    ]
  }

  const handle = (scale) => (val, path) => {
    // console.log(path.reduce((prev, curr, index) => {
    //     if (!prev) {
    //         return curr
    //     }
    //     return prev + '\n' + '-'.padEnd(index * 2, '-') + curr
    // }, ''))

    if (/series,\d+,data,\d+$/.test(path.join(','))) return val
    if (/^\d+$/.test(val)) {
      return val * scale
    }
    return val
  }

  const result = traverse(source, handle(2))

  expect(result.grid.left).toBe(60)
  expect(result.grid.right).toBe(60)
  expect(result.grid.bottom).toBe(80)
  expect(result.series[0].data[0]).toBe(120)
})

test('循环引用', () => {
  const source = {
    title: {
      text: 'Stacked Line'
    },
    series: [
      {
        name: 'Email',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210]
      }
    ]
  }

  source.title.loop = source.title
  source.series[1] = source.series[0]

  const handle = (val) => {
    return val
  }

  const result = traverse(source, handle)

  expect(result.title).toBe(result.title.loop)
  expect(result.series[0]).toBe(result.series[1])
})