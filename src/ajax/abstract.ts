import type { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios'

import Axios from 'axios'

export interface IBaseAXiosConfig extends AxiosRequestConfig {
  onceAtSameTime?: boolean
  getCancelTokenKey?(config: IBaseAXiosConfig): any
}

export interface ICompleteAxiosConfig<T = any> extends IBaseAXiosConfig {
  onSuccess(res: ResponseData<T>): void
  onFail(res: AxiosError<ResponseData>): void
}

export type AllowedRequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

export type ResponseData<T = any> = {
  message: T
  status: number
}

export default class Request {
  protected instance: AxiosInstance
  protected PENDING = new Promise<never>(() => {})
  protected cancelTokenMap = new Map()
  constructor(baseCofig: IBaseAXiosConfig | ICompleteAxiosConfig = { onceAtSameTime: true }) {
    this.instance = Axios.create(baseCofig)
  }
  protected _createAjax<T>(url: string, method: AllowedRequestMethod = 'POST') {
    return <C extends IBaseAXiosConfig>(data: any, otherConfig: C) => {
      const config = {
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

  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: IBaseAXiosConfig): ResponseData<T>
  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: ICompleteAxiosConfig<T>): void
  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: IBaseAXiosConfig | ICompleteAxiosConfig<T>): ResponseData<T> | void {
    const { data } = response
    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing
    if ('onSuccess' in config) {
      return config.onSuccess(data)
    }
    return data
  }

  private onFail(error: AxiosError<ResponseData>, config: IBaseAXiosConfig): Promise<never> | never
  private onFail(error: AxiosError<ResponseData>, config: ICompleteAxiosConfig): Promise<never> | void
  private onFail(error: AxiosError<ResponseData>, config: IBaseAXiosConfig | ICompleteAxiosConfig | any): Promise<never> | never | void {
    if (Axios.isCancel(error)) {
      return this.PENDING
    }
    if ('onFail' in config) return config.onFail(error)
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
