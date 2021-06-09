export default class BaseCache{
    private _cacheKey=''

    constructor({ cacheKey = '' }) {
      this.cacheKey = cacheKey
    }

    get cacheKey() {
      return this._cacheKey
    }

    set cacheKey(v) {
      console.log(`change cacheKey:${this.cacheKey === '' ? '空' : this.cacheKey} to cacheKey:${v}`)
      this._cacheKey = v
    }
}