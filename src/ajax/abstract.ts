import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'

import Axios from 'axios'

export type ResponseData<T = any> = {
  errmsg: string
  message: T
  status: number
}

export interface IBaseAxiosConfig extends AxiosRequestConfig {
  onceAtSameTime?: boolean
  getCancelTokenKey?(config: unknown): any
}

export interface IPromiseAxiosConfig extends IBaseAxiosConfig {
  customErrorHandler?: boolean
}
export type IPromiseAxiosThenValue<T> = { data: ResponseData<T>; config: IPromiseAxiosConfig }
export type IPromiseAxiosErrorValue = { error: AxiosError<ResponseData>; config: IPromiseAxiosConfig }

export interface ICallBackAxiosConfig<T> extends IBaseAxiosConfig {
  onSuccess(res: ResponseData<T>, conifg: ICallBackAxiosConfig<T>): void
  onFail(res: AxiosError<ResponseData>, conifg: ICallBackAxiosConfig<T>): void
}

export const PENDING = new Promise<never>(() => {})

export type AllowedRequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

export default class Request {
  protected instance: AxiosInstance

  public cancelTokenMap = new Map<any, CancelTokenSource>()

  constructor(baseCofig: IBaseAxiosConfig = { onceAtSameTime: true }) {
    this.instance = Axios.create(baseCofig)
  }

  protected _createAjax<T>(url: string, method: AllowedRequestMethod = 'POST') {
    const _this = this
    function fn(data: any, extraConfig: ICallBackAxiosConfig<T>): Promise<void>
    function fn(data: any, extraConfig?: IPromiseAxiosConfig): Promise<IPromiseAxiosThenValue<T>>
    function fn(this: Request, data: any, extraConfig?: IPromiseAxiosConfig | ICallBackAxiosConfig<T>): any {
      return _this.runRequest<T>(url, method, data, extraConfig)
    }

    // type IFn = {
    //   (data: any, extraConfig: ICallBackAxiosConfig<T>): Promise<void>
    //   (data: any, extraConfig: IPromiseAxiosConfig): Promise<ResponseData<T>>
    // }
    // const fn = ((data, extraConfig) => {
    //   return this.runRequest<T>(url, method, data, extraConfig)
    // }) as IFn

    return fn
  }

  // runRequest<T>(url: string, method: AllowedRequestMethod, data: any, extraConfig: ICallBackAxiosConfig<T>): Promise<void>
  // runRequest<T>(url: string, method: AllowedRequestMethod, data: any, extraConfig: IPromiseAxiosConfig): Promise<ResponseData<T>>
  protected runRequest<T>(
    url: string,
    method: AllowedRequestMethod,
    data: any,
    extraConfig?: IPromiseAxiosConfig | ICallBackAxiosConfig<T>
  ): Promise<IPromiseAxiosThenValue<T> | void> {
    // ):  {
    const config = {
      ...(this.instance.defaults as IBaseAxiosConfig),
      url,
      method,
      [method === 'GET' ? 'data' : 'params']: data,
      ...extraConfig,
    }
    if (config.onceAtSameTime && config.cancelToken === undefined) {
      const getCancelTokenKey = config.getCancelTokenKey || (() => config.url)
      const key = getCancelTokenKey(config)
      const source = Axios.CancelToken.source()
      config.cancelToken = source.token
      if (this.cancelTokenMap.has(key)) {
        this.cancelTokenMap
          .get(key)!
          .cancel(`previous request was cancelled to ensure that guarad only one ${key} request existed on the network at the same time`)
      }
      this.cancelTokenMap.set(key, source)
    }
    // <void | ResponseData, void | AxiosError<ResponseData>>
    const p = this.instance.request(config)
    return p.then(
      // ()=>{throw new Error('12')},
      (...args) => this.onSuccess<T>(...args, config),
      (...args) => this.onFail(...args, config)
    )
  }

  // test1(config: ICallBackAxiosConfig): null
  // test1(config: IPromiseAxiosConfig): number
  // test1(config: ICallBackAxiosConfig | IPromiseAxiosConfig): null | number {
  //   if ('onSuccess' in config) {
  //     const c = config
  //     return null
  //   }
  //   return 1
  // }

  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: ICallBackAxiosConfig<T>): void

  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: IPromiseAxiosConfig): IPromiseAxiosThenValue<T>

  private onSuccess<T>(
    response: AxiosResponse<ResponseData<T>>,
    config: IPromiseAxiosConfig | ICallBackAxiosConfig<T>
  ): IPromiseAxiosThenValue<T> | void {
    const { data } = response
    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing
    if ('onSuccess' in config) {
      return config.onSuccess(data, config)
    }
    return { data, config }
  }

  private onFail<T = any>(error: AxiosError<ResponseData>, config: ICallBackAxiosConfig<T>): Promise<never> | void

  private onFail(error: AxiosError<ResponseData>, config: IPromiseAxiosConfig): Promise<never>

  private onFail<T = any>(error: AxiosError<ResponseData>, config: IPromiseAxiosConfig | ICallBackAxiosConfig<T>): Promise<never> | void {
    if (Axios.isCancel(error)) {
      return PENDING
    }
    if ('onFail' in config) {
      return config.onFail(error, config)
    }
    return Promise.reject({ error, config })
  }
}
