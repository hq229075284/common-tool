/* eslint-disable id-length */
export const CONTINUE = 'continue'
export const STOP = 'stop'

interface IBeforeHook {
  (done: () => void): void
}

interface IAfterHook {
  (): void
}

interface IOption {
  interval: number
  leading: boolean
  autoStart: boolean
  hooksBeforeRun: Array<IBeforeHook>
  hooksAfterRun: Array<IAfterHook>
}

interface IFunc{
  ():void | Promise<unknown>
}

export default class Loop {
  private option: IOption

  private func:IFunc

  private runId = 0

  private timer = -1

  private disableRun = false

  constructor(func: IFunc, option: Partial<IOption>) {
    const defaultOption: IOption = {
      interval: 60 * 1000,
      hooksBeforeRun: [],
      hooksAfterRun: [],
      leading: false,
      autoStart: true,
    }
    this.option = { ...defaultOption, ...option }

    this.func = func

    if (this.option.autoStart) {
      this.start()
    }
  }

  private run(): Promise<unknown> {
    if (this.disableRun) return Promise.reject(STOP)
    // eslint-disable-next-line no-async-promise-executor
    return new Promise((resolve, reject) => {
      let hookIndex = 0
      this.runId += 1
      const { runId } = this

      const runFunc = () => {
        let p = this.func()
        p = p instanceof Promise ? p : Promise.resolve(p)
        return p
      }

      const done = () => {
        if (runId !== this.runId) {
          reject(STOP)
          return
        }
        hookIndex += 1
        if (hookIndex < this.option.hooksBeforeRun.length) {
          // eslint-disable-next-line no-use-before-define
          runBeforeHook()
        } else {
          // eslint-disable-next-line no-use-before-define
          runFunc().then(runAfterHook).then(resolve).catch(reject)
        }
      }

      const runBeforeHook = () => {
        this.option.hooksBeforeRun[hookIndex](done)
      }

      const runAfterHook = () => {
        if (this.runId !== runId) {
          throw STOP
        }
        this.option.hooksAfterRun.forEach((hook) => hook())
      }

      if (this.option.hooksBeforeRun.length) {
        runBeforeHook()
      } else {
        runFunc().then(runAfterHook).then(resolve).catch(reject)
      }
    })
  }

  private delayRun(): void {
    clearTimeout(this.timer)// 确保仅有1个计时器有效
    this.timer = window.setTimeout(() => {
      this.guardRun()
    }, this.option.interval)
  }

  private guardRun() {
    this.run()
      .then(() => this.delayRun())
      .catch((e) => {
        if (e === CONTINUE) {
          this.delayRun()
          return
        }
        if (e === STOP) {
          return
        }
        // eslint-disable-next-line no-console
        console.error('guardRun exception')
        throw e
      })
  }

  // 先执行stop，后执行start，且以同步方式进行时，leading参数无效，因为此时disableRun为true
  start(): void {
    if (this.option.leading) {
      this.guardRun()
    } else {
      this.delayRun()
    }
  }

  reset(): void {
    this.stop()
    setTimeout(() => { this.start() })
  }

  /**
   * 三个阶段要stop
   * 1、清除进行中的计时器
   * 2、清除已加入宏任务队列未执行的任务
   * 3、取消正在执行hooksBeforeRun阶段的任务
   */
  stop(): void {
    // 当run的timeout回调已在宏任务的回调队列中时，取消这次run的执行
    this.disableRun = true
    setTimeout(() => {
      this.disableRun = false
    })
    clearTimeout(this.timer)// 取消setTimeout
    this.runId += 1// 取消进行中的hook
  }
}
