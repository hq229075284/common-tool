import cloneDeep from 'lodash/cloneDeep'

export type IDoneFunction = (flowId: number, ...prevReturnValue: any[]) => void
export type IWorkFunction = (done: IDoneFunction, flowId: number, ...prevReturnValue: any[]) => void | Promise<any>

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
  mergeOptionToProperty: Function
  reset: Function
  start: Function
  started: boolean
  finished: boolean
  // execWork: Function
  // done: IDoneFunction
}

export default class Workflow implements IWorkflow {
  flowId = 0
  workIndex = 0
  finished = false
  started = false

  workQueue = [] as IWorkFunction[]

  initOptions: IOption

  constructor(option: IOption = {}) {
    this.initOptions = option
    this.mergeOptionToProperty()
  }

  // 添加工作任务
  addWork(flowId, workFunction: IWorkFunction) {
    if (typeof flowId !== 'number') {
      throw new Error('addWork的第一个参数需为number类型，表示工作任务要添加到的目标工作队列id')
    }
    if (this.flowId !== flowId) return
    if (this.finished) {
      throw new Error('工作流程id:' + flowId + '已完成，无法动态添加新的任务到此工作流程中')
    }
    this.workQueue.push(workFunction)
  }

  // 合并option中的属性到实例上
  mergeOptionToProperty() {
    Object.keys(this.initOptions).forEach((key) => {
      const value = this.initOptions[key]
      this[key] = cloneDeep(value)
    })
  }

  // 恢复指针、默认实例属性
  // 重置开始、结束状态、flowId
  reset() {
    this.workIndex = 0
    this.flowId += 1
    this.finished = false
    this.started = false
    this.mergeOptionToProperty()
  }

  // 队列开始执行
  start() {
    if (this.started) {
      throw new Error('当前队列一开始执行，请执行reset函数后再执行start函数')
    }
    this.started = true
    this.execWork()
  }

  // 执行工作任务
  private execWork(...prevReturnValue: any[]) {
    const bindDone = this.done.bind(this, this.flowId)
    if (this.workQueue[this.workIndex]) {
      const returnValue = this.workQueue[this.workIndex](bindDone, this.flowId, ...prevReturnValue)
      if (returnValue instanceof Promise) {
        returnValue.then(bindDone)
      }
    } else {
      throw new Error('工作任务索引:`' + this.workIndex + '`不存在')
    }
  }

  // 工作任务完成回调
  private done(flowId: number, ...args: any[]) {
    if (this.flowId !== flowId) return
    if (this.workIndex === this.workQueue.length - 1) {
      this.finished = true
      return
    }
    this.workIndex += 1
    this.execWork(...args)
  }
}
