import BaseCache from './base'

export default class SessionStorageCache extends BaseCache {
  setCache(key: string, value: any) {
    const sessionStorageString = sessionStorage.getItem(this.cacheKey)
    let cache = {}
    if (sessionStorageString) {
      cache = JSON.parse(sessionStorageString)
    }
    cache[key] = value
    sessionStorage.setItem(this.cacheKey, JSON.stringify(cache))
  }

  getCache(key: string) {
    try {
      //@ts-expect-error
      const cache = JSON.parse(sessionStorage.getItem(this.cacheKey))
      if (key) {
        return cache[key] || ''
      }
      return cache
    } catch {
      if (key) return ''
      return {}
    }
  }

  removeCache(cacheKey = this.cacheKey) {
    sessionStorage.removeItem(cacheKey)
  }
}
