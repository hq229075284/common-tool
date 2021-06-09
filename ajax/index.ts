import type { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios'

import Axios from 'axios'

export interface CustomConfig<T = any> extends AxiosRequestConfig {
  onceAtSameTime?: boolean
  onSuccess?(res: ResponseData<T>): void
  onFail?(res: AxiosError<ResponseData>): void
  getCancelTokenKey?(config: CustomConfig<T>): any
}

export type AllowedRequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

export type ResponseData<T = any> = {
  message: T
  status: number
}

export default class Request {
  instance: AxiosInstance
  PENDING = new Promise<never>(() => {})
  cancelTokenMap = new Map()
  constructor(baseCofig: CustomConfig = { onceAtSameTime: true }) {
    this.instance = Axios.create(baseCofig)
  }
  protected _createAjax<T>(url: string, method: AllowedRequestMethod = 'POST') {
    return (data: any, otherConfig: CustomConfig) => {
      const config: CustomConfig = {
        ...this.instance.defaults,
        url,
        method,
        [method === 'GET' ? 'data' : 'params']: data,
        ...otherConfig,
      }
      if (config.onceAtSameTime && config.cancelToken === undefined) {
        const getCancelTokenKey = config.getCancelTokenKey || (() => config.url)
        const key = getCancelTokenKey(config)
        const source = Axios.CancelToken.source()
        config.cancelToken = source.token
        if (this.cancelTokenMap.has(key)) {
          this.cancelTokenMap
            .get(key)
            .cancel(`previous request was cancelled to ensure that guarad only one ${key} request existed on the network at the same time`)
        }
        this.cancelTokenMap.set(key, source)
      }
      // <void | ResponseData, void | AxiosError<ResponseData>>
      return this.instance.request(config).then(
        (...args) => this.onSuccess<T>(...args, config),
        (...args) => this.onFail(...args, config)
      )
    }
  }
  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: CustomConfig) {
    const { data } = response
    if (config.onSuccess) {
      return config.onSuccess(data)
    }
    return data
  }
  private onFail(error: AxiosError<ResponseData>, config: CustomConfig) {
    if (Axios.isCancel(error)) {
      return this.PENDING
    }
    if (config.onFail) return config.onFail(error)
    // return Promise.reject<AxiosError<ResponseData>>(error)
    throw error
  }
}

// const a = new Request()
// a.createAjax('', 'POST')(
//   {},
//   {
//     // onSuccess(e) {
//     //   console.log(e)
//     // },
//   }
// ).then((r) => {
//   if (r) {
//     r.status
//   }
// })
