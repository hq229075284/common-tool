export const EXPIRE = 'expire'

class EventEmitter {
  query = {}
  on(key, cb) {
    this.query[key] = this.query[key] || []
    this.query[key].push(cb)
  }
  off(key, cb) {
    if (this.query[key]?.includes(cb)) {
      const fidx = this.query[key].indexOf(cb)
      this.query[key].splice(fidx, 1)
    }
  }
  emit(args: { type: typeof EXPIRE; key: string }) {
    this.query[args.key].forEach((cb) => {
      cb(args)
    })
  }
}

class Store<T> {
  store: {}
  STORE_KEY: string
  constructor(key?: string) {
    this.STORE_KEY = key || 'store_umkf4qmubxh'
    const sessionStr = window.sessionStorage.getItem(this.STORE_KEY)
    if (sessionStr) {
      this.store = JSON.parse(sessionStr)
    } else {
      this.store = {}
    }
  }
  syncPersistence() {
    window.sessionStorage.setItem(this.STORE_KEY, JSON.stringify(this.store))
  }
  set(key: string, value: T) {
    this.store[key] = value
    this.syncPersistence()
  }
  get(key): T {
    return this.store[key]
  }
  has(key) {
    return key in this.store
  }
  remove(key) {
    Reflect.deleteProperty(this.store, key)
    this.syncPersistence()
  }
}

interface IStoreItem {
  payload: any
  expireTimeStamp: number
  timer: number
}

export class AliveDetection extends EventEmitter {
  store = new Store<IStoreItem>()

  set(key, payload, expireTimeStamp) {
    if (this.store.has(key)) {
      this.remove(key)
    }
    this.store.set(key, {
      payload,
      expireTimeStamp,
      timer: this.watchLive(key, expireTimeStamp),
    })
  }
  remove(key: string) {
    window.clearTimeout(this.store.get(key).timer)
    this.store.remove(key)
  }
  get(key) {
    this.store.get(key).payload
  }

  watchLive(key, expireTimeStamp) {
    return window.setTimeout(() => {
      this.emit({ type: EXPIRE, key })
    }, expireTimeStamp - Date.now())
  }
}
