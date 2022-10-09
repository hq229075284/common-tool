export default class EventBus {
  listenerMap = new Map<string, Array<Function>>()
  on(eventName: string, listener: Function) {
    if (this.listenerMap.has(eventName)) {
      this.listenerMap.get(eventName)!.push(listener)
    } else {
      this.listenerMap.set(eventName, [listener])
    }
  }
  off(eventName: string, listener?: Function) {
    if (this.listenerMap.has(eventName)) {
      if (listener) {
        const listeners = this.listenerMap.get(eventName)!
        const fidx = listeners.findIndex((_listener) => _listener === listener)
        if (fidx > -1) listeners.splice(fidx, 1)
        if (!listener.length) this.listenerMap.delete(eventName)
      } else {
        this.listenerMap.delete(eventName)
      }
    }
  }
  emit(key, ...args) {
    const listeners = this.listenerMap.get(key)
    if (listeners) {
      listeners.forEach((listener) => listener(...args))
    }
  }
}
