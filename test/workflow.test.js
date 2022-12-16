import Workflow from '../src/workflow/index'

test('静态工作队列执行', (testDone) => {
  function task1(done) {
    done(1)
  }

  function task2(done, flowId, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      done(2)
    }, 1000)
  }

  function task3(done, flowId, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(2)
      done()
      testDone()
    }, 1000)
  }

  const flow = new Workflow({
    workQueue: [task1, task2, task3]
  })

  flow.start()
})

test('动态工作队列执行', (testDone) => {
  function task1(done, flowId) {
    flow.addWork(flowId, task2)
    done(1)
  }

  function task2(done, flowId, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      flow.addWork(flowId, task3)
      done(2)
    }, 1000)
  }

  function task3(done, flowId, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(2)
      done()
      testDone()
    }, 1000)
  }

  const flow = new Workflow({})

  flow.addWork(flow.flowId, task1)

  flow.start()
})

test('动静混合工作队列执行', (testDone) => {
  function task1(done) {
    done(1)
  }

  function task2(done, flowId, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      flow.addWork(flowId, task3)
      done(2)
    }, 1000)
  }

  function task3(done, flowId, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(2)
      done()
      testDone()
    }, 1000)
  }

  const flow = new Workflow({
    workQueue: [task1, task2]
  })

  flow.start()
})

test('中断工作', (testDone) => {
  let execTask1 = false
  let execTask2 = false
  function task1(done) {
    setTimeout(() => {
      execTask1 = true
      done(1)
    }, 1000)
  }

  function task2(done, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      execTask2 = true
      done()
    }, 1000)
  }

  const flow = new Workflow({
    workQueue: [task1, task2]
  })

  flow.start()

  setTimeout(() => {
    flow.reset()
  }, 500)

  setTimeout(() => {
    expect(execTask1).toBe(true)
    expect(execTask2).toBe(false)
    testDone()
  }, 2000)
})

test('中断后另起工作', (testDone) => {
  let execTask1Count = 0
  let execTask2Count = 0

  function task1(done) {
    setTimeout(() => {
      execTask1Count++
      done(1)
    }, 1000)
  }
  function task2(done, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      execTask2Count++
      done()
    }, 1000)
  }

  const flow = new Workflow({
    workQueue: [task1, task2]
  })

  flow.start()

  setTimeout(() => {
    flow.reset()
    flow.start()
  }, 500)

  setTimeout(() => {
    expect(execTask1Count).toBe(2)
    expect(execTask2Count).toBe(1)
    testDone()
  }, 3000)
})

test('工作队列执行完成后添加新的工作任务时，抛出错误提示', () => {
  function task1(done, flowId) {
    done(1)
    expect(() => flow.addWork(flowId, task2)).toThrow(/^工作流程id:\d+已完成，无法动态添加新的任务到此工作流程中$/)
  }

  function task2() { }

  const flow = new Workflow({
    workQueue: [task1]
  })

  flow.start()
})

test('addWork时没有指定flowId，抛出错误信息', () => {
  function task1(done, flowId) {
    expect(() => flow.addWork(task2)).toThrow('addWork的第一个参数需为number类型，表示工作任务要添加到的目标工作队列id')
    done(1)
  }

  function task2() { }

  const flow = new Workflow({
    workQueue: [task1]
  })

  flow.start()
})

test('同一任务队列，在不执行reset的前提下，多次执行start，抛出错误信息', () => {
  function task1(done, flowId) {
    setTimeout(() => {
      done(1)
    }, 500)
  }

  const flow = new Workflow({
    workQueue: [task1]
  })

  expect(() => {
    flow.start()
    flow.start()
  }).toThrow('当前队列一开始执行，请执行reset函数后再执行start函数')
})