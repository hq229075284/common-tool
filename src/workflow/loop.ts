import Workflow from '.'
import type { IWork } from '.'

interface IWorkflowPool {
  workflows: Workflow[]
  workQueue: IWork[]
  setWorkStep(fn: IWork): boolean
  removeWorkStep(fn: IWork): boolean
  createWorkFlow(): Workflow
  startWorkFlow(): Workflow
}

export default class Loop implements IWorkflowPool {
  workflows = [] as Workflow[]
  workQueue = [] as IWork[]
  setWorkStep(fn: IWork) {
    this.workQueue.push(fn)
    this.workflows.forEach((workflow) => {
      workflow.setWorkStep(fn)
    })
    return true
  }
  removeWorkStep(fn: IWork) {
    let isSuccess = true
    this.workflows.forEach((workflow) => {
      if (!workflow.removeWorkStep(fn)) {
        isSuccess = false
      }
    })
    return isSuccess
  }
  createWorkFlow() {
    const workflow = new Workflow()
    this.workQueue.forEach((work) => {
      workflow.setWorkStep(work)
    })
    return workflow
  }
  startWorkFlow() {
    let idleWorkflow = this.workflows.find((workflow) => !workflow.working) || this.createWorkFlow()
    idleWorkflow.startWorkFlow()
    return idleWorkflow
  }
}
