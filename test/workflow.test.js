import Workflow from '../src/workflow/index'

test('静态工作队列执行', (testDone) => {
  function task1(done) {
    done(1)
  }

  function task2(done, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      done(2)
    }, 1000)
  }

  function task3(done, prevValue) {
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
  function task1(done) {
    flow.addWork(task2)
    done(1)
  }

  function task2(done, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      flow.addWork(task3)
      done(2)
    }, 1000)
  }

  function task3(done, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(2)
      done()
      testDone()
    }, 1000)
  }

  const flow = new Workflow({})

  flow.addWork(task1)

  flow.start()
})

test('动静混合工作队列执行', (testDone) => {
  function task1(done) {
    done(1)
  }

  function task2(done, prevValue) {
    setTimeout(() => {
      expect(prevValue).toEqual(1)
      flow.addWork(task3)
      done(2)
    }, 1000)
  }

  function task3(done, prevValue) {
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