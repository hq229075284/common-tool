export type IDoneFunction = (flowId: number, ...prevReturnValue: any[]) => void
export type IWorkFunction = (done: IDoneFunction, ...prevReturnValue: any[]) => void | Promise<any>

// export function workWrapper(fn: Function) {
//   return fn
// }

export interface IOption {
  workQueue?: IWorkFunction[]
}

export interface IWorkflow {
  flowId: number
  workIndex: number
  workQueue: IWorkFunction[]
  initOptions: IOption
  addWork: Function
  clear: Function
  reset: Function
  start: Function
  // execWork: Function
  // done: IDoneFunction
}

export default class Workflow implements IWorkflow {
  flowId = 0
  workIndex = 0

  workQueue = [] as IWorkFunction[]

  initOptions: IOption

  constructor(option: IOption = {}) {
    this.initOptions = option
    if (this.initOptions?.workQueue) {
      this.workQueue = [...this.initOptions.workQueue]
    }
  }

  get addWork() {
    return this._addWork.bind(this, this.flowId)
  }

  // 添加工作任务
  private _addWork(flowId, workFunction: IWorkFunction) {
    if (this.flowId !== flowId) return
    this.workQueue.push(workFunction)
  }

  // 恢复初始工作队列
  clear() {
    if (this.initOptions?.workQueue) {
      this.workQueue = [...this.initOptions.workQueue]
    }
  }

  // 恢复指针和重置flowId
  reset() {
    this.workIndex = 0
    this.flowId += 1
  }

  // 队列开始执行
  start() {
    this.execWork()
  }

  // 执行工作任务
  private execWork(...prevReturnValue: any[]) {
    const bindDone = this.done.bind(this, this.flowId)
    const returnValue = this.workQueue[this.workIndex](bindDone, ...prevReturnValue)
    if (returnValue instanceof Promise) {
      returnValue.then(bindDone)
    }
  }

  // 工作任务完成回调
  private done(flowId, ...args: any[]) {
    if (this.flowId !== flowId) return
    if (this.workIndex === this.workQueue.length - 1) return
    this.workIndex += 1
    this.execWork(...args)
  }
}
