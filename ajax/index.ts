import type { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios'

import Axios, { CancelToken } from 'axios'

export interface CustomConfig extends AxiosRequestConfig {
  onceAtSameTime?: boolean
  onSuccess?(res: responseData): void
  onFail?(res: AxiosError<responseData>): void
  getCancelTokenKey?(config: CustomConfig): any
}
export type AllowedRequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

export type responseData = {
  message: any
  status: number
}

export default class Request {
  instance: AxiosInstance
  PENDING = new Promise<never>(() => {})
  cancelTokenMap = new Map()
  constructor(baseCofig: CustomConfig = { onceAtSameTime: true }) {
    this.instance = Axios.create(baseCofig)
  }
  protected createAjax(url: string, method: AllowedRequestMethod = 'POST') {
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
      // <void | responseData, void | AxiosError<responseData>>
      return this.instance.request<responseData>(config).then(
        (...args) => this.onSuccess(...args, config),
        (...args) => this.onFail(...args, config)
      )
    }
  }
  private onSuccess(response: AxiosResponse<responseData>, config: CustomConfig) {
    const { data } = response
    if (config.onSuccess) {
      return config.onSuccess(data)
    }
    return data
  }
  private onFail(error: AxiosError<responseData>, config: CustomConfig) {
    if (Axios.isCancel(error)) {
      return this.PENDING
    }
    if (config.onFail) return config.onFail(error)
    // return Promise.reject<AxiosError<responseData>>(error)
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
