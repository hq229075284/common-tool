import BaseCache from './base'

export default class SessionStorageCache extends BaseCache {
  setCache(key: string, value: any) {
    const cache = JSON.parse(sessionStorage.getItem(this.cacheKey)) || {}
    cache[key] = value
    sessionStorage.setItem(this.cacheKey, JSON.stringify(cache))
  }

  getCache(key: string) {
    try {
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
