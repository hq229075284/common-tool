// interface CustomResizeObserver extends ResizeObserver {
//   targetMapToCallback: Map<HTMLElement, Function>
// }
import 'resize-observer-polyfill'

class DcResizeObserver {
  private targetMapToCallback: Map<Element, Function[]> = new Map()
  private ob: ResizeObserver
  private ignoreResizeObserverOnce = true

  constructor() {
    this.ob = new ResizeObserver(this.schedule.bind(this))
  }

  /**
   * 调度
   * @param entries ResizeObserverEntry[]
   * @param observer ResizeObserver
   */
  private schedule(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
    if (this.ignoreResizeObserverOnce) {
      this.ignoreResizeObserverOnce = false
      return
    }
    entries.forEach((entry) => {
      const callbacks = this.targetMapToCallback.get(entry.target)
      if (callbacks && callbacks.length) {
        callbacks.forEach((cb) => cb(entry))
      }
    })
  }

  /**
   * 解除元素大小监听
   * @param target 被监听的目标元素
   */
  unobserve(target: Element, callback?: Function): void {
    if (this.targetMapToCallback.has(target)) {
      if (callback) {
        const cbs = this.targetMapToCallback.get(target)!
        const fidx = cbs.indexOf(callback)
        // 存在对应的要移除的callback
        if (fidx > -1) {
          // 移除后清空
          if (cbs.length === 1) {
            this.targetMapToCallback.delete(target)
            this.ob.unobserve(target)
          } else {
            // 移除对应的callback
            cbs.splice(fidx, 1)
          }
        }
      } else {
        // 未提供第二个参数时，清空该元素的所有
        this.targetMapToCallback.delete(target)
        this.ob.unobserve(target)
      }
    }
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

export default DcResizeObserver

// new ResizeObserver(() => {
//   /* 变化 */
// }).observe(document.documentElement)

// new DcResizeObserve().observe(document.documentElement, () => console.log(1))
