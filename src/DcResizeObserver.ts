// interface CustomResizeObserver extends ResizeObserver {
//   targetMapToCallback: Map<HTMLElement, Function>
// }
class DcResizeObserve {
  private targetMapToCallback: Map<Element, Function[]> = new Map()
  private ob: ResizeObserver
  private ignoreResizeObserverOnce = true

  constructor() {
    this.ob = new ResizeObserver(this.schedule)
  }

  /**
   * 调度
   * @param entries ResizeObserverEntry[]
   * @param observer ResizeObserver
   */
  private schedule(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
    this.ignoreResizeObserverOnce = false
    entries.forEach((entry) => {
      const callbacks = this.targetMapToCallback.get(entry.target)
      if (callbacks && callbacks.length) {
        callbacks.forEach((cb) => cb())
      }
    })
  }

  /**
   * 解除元素大小监听
   * @param target 被监听的目标元素
   */
  unobserve(target: Element): void {
    if (this.targetMapToCallback.has(target)) this.targetMapToCallback.delete(target)
    this.ob.unobserve(target)
  }

  /**
   * 对目标元素添加监听大小变化的回调
   * @param target 目标元素
   * @param callback 监听回调
   */
  observe(target: Element, callback: Function): void {
    if (this.targetMapToCallback.has(target)) {
      this.targetMapToCallback.set(target, this.targetMapToCallback.get(target)!.concat([callback]))
    } else {
      this.targetMapToCallback.set(target, [callback])
    }
    this.ignoreResizeObserverOnce = true
    this.ob.observe(target)
  }
}

// new ResizeObserver(() => {
//   /* 变化 */
// }).observe(document.documentElement)

// new DcResizeObserve().observe(document.documentElement, () => console.log(1))
