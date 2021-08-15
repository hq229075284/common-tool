export interface IWork {
  (done?: IWorkflow['done'], ...prevReturnValue: any[]): void | Promise<any>
}

export interface IWorkflow {
  isAborted: boolean
  waitToStartNextWorkFlow: boolean
  working: boolean
  workQueue: Array<IWork>
  done(): void
  doAbort(): void
  setWorkStep(fn: IWork): boolean
  removeWorkStep(fn: IWork): boolean
  startWorkFlow(): void
  doWork(...args: any[]): void
  workIndex: number
}

export default class Workflow implements IWorkflow {
  isAborted = false
  waitToStartNextWorkFlow = false
  working = false
  workQueue = [] as IWork[]
  workIndex = 0
  doAbort() {
    if (this.working) {
      this.isAborted = true
      this.waitToStartNextWorkFlow = false
    }
  }
  setWorkStep(fn: IWork): boolean {
    this.workQueue.push(fn)
    return true
  }
  removeWorkStep(fn: IWork) {
    const fidx = this.workQueue.indexOf(fn)
    if (fidx > -1) {
      if (fidx <= this.workIndex) {
        this.workIndex--
      }
      this.workQueue.splice(fidx, 1)
      return true
    }
    return false
  }
  done(...currentReturnValue) {
    if (this.isAborted) {
      this.workIndex = 0
      this.isAborted = false
      if (this.waitToStartNextWorkFlow) {
        this.waitToStartNextWorkFlow = false
        this.doWork()
      } else {
        this.working = false
      }
    } else if (this.workIndex < this.workQueue.length - 1) {
      this.workIndex += 1
      this.doWork(...currentReturnValue)
    } else {
      this.workIndex = 0
      this.working = false
    }
  }
  doWork(...prevReturnValue) {
    const work = this.workQueue[this.workIndex]
    if (work) {
      //   if (work.length >= 1) {
      //     const ret = work(this.done, ...prevReturnValue)
      //     if (ret instanceof Promise) {
      //       ret.then(this.done)
      //     }
      //   } else {
      const ret = work(...prevReturnValue)
      if (ret instanceof Promise) {
        ret.then(this.done)
      } else {
        this.done(ret)
      }
      //   }
    }
  }
  startWorkFlow() {
    if (this.working) {
      this.isAborted = true
      this.waitToStartNextWorkFlow = true
    } else {
      this.working = true
      this.doWork()
    }
  }
}
