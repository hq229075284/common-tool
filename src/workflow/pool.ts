import Workflow from '.'

interface IWorkflowPool {
  workflows: Workflow[]
  createWorkFlow(): Workflow
  getWorkFlow(): Workflow
}

export default class Pool implements IWorkflowPool {
  workflows = [] as Workflow[]
  createWorkFlow() {
    const workflow = new Workflow()
    this.workflows.push(workflow)
    return workflow
  }
  getWorkFlow() {
    let idleWorkflow = this.workflows.find((workflow) => !workflow.working) || this.createWorkFlow()
    return idleWorkflow
  }
}
