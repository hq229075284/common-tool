import EventBus from './event'
import { STATUS } from './enum'

export interface ISourceDescription {
  status: typeof STATUS[keyof typeof STATUS]
  sign: string | number
  originData: any
}

class Share extends EventBus {
  cache = new Map<ISourceDescription['sign'], ISourceDescription>()
  getSharedItem(key: ISourceDescription['sign']) {
    return this.cache.get(key)
  }
  setSharedItem(key: ISourceDescription['sign'], item: ISourceDescription) {
    if (this.cache[key]) {
      console.log(`share.cache[${key}]已存在缓存值，怀疑隐藏bug`)
    } else {
      this.cache.set(key, item)
    }
  }
}

export default new Share()
