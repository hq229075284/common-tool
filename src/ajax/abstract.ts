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
  getCancelTokenSource?(): CancelTokenSource
}

export interface IPromiseAxiosConfig extends IBaseAxiosConfig {
  getCancelTokenKey?(config: IPromiseAxiosConfig): any
  customErrorHandler?: boolean
}
export type IPromiseAxiosThenValue<T> = { data: ResponseData<T>; config: IPromiseAxiosConfig; response: AxiosResponse<ResponseData<T>> }
export type IPromiseAxiosErrorValue = { error: AxiosError<ResponseData>; config: IPromiseAxiosConfig }

export interface ICallBackAxiosConfig<T> extends IBaseAxiosConfig {
  getCancelTokenKey?(config: ICallBackAxiosConfig<T>): any
  onSuccess(res: ResponseData<T>, conifg: ICallBackAxiosConfig<T>, response: AxiosResponse<ResponseData<T>>): void
  onFail(res: AxiosError<ResponseData>, conifg: ICallBackAxiosConfig<T>): void
}

export const PENDING = new Promise<never>(() => {})

export type AllowedRequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

interface ISourceItem {
  only?: boolean
  source: CancelTokenSource
}
export default class Request {
  protected instance: AxiosInstance

  public pendingSourceMap = new Map<any, ISourceItem[]>()

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
      [method === 'GET' ? 'params' : 'data']: data,
      ...extraConfig,
    }
    let source: CancelTokenSource
    if (config.getCancelTokenSource) {
      source = config.getCancelTokenSource()
    } else {
      // 为当前请求创建一个source
      source = Axios.CancelToken.source()
    }
    // 使`source.cancel()`生效
    config.cancelToken = source.token
    // 获取pendingSourceMap的key
    const getCancelTokenKey = config.getCancelTokenKey || (() => config.url)
    const key = getCancelTokenKey(config)
    // key对应的请求source数组
    let pendingSources = this.pendingSourceMap.get(key) || []
    let sourceItem = { only: false, source }
    if (config.onceAtSameTime) {
      /*
       * 同一个key中，所有设置了`onceAtSameTime`为`true`的请求在网络上只能同时存在1个，
       * 所以需要先取消掉之前标记为`only:true`的请求source（即配置项中`onceAtSameTime`为`true`）
       */
      pendingSources = pendingSources.filter((sourceItem) => {
        if (sourceItem.only) {
          sourceItem.source.cancel(
            `previous request was cancelled to ensure that guarad only one ${key} request existed on the network at the same time`
          )
          return false
        }
        return true
      })
      sourceItem = { only: true, source }
    }
    // 记录新的请求source
    pendingSources.push(sourceItem)
    this.pendingSourceMap.set(key, pendingSources)

    const p = this.instance.request(config)
    return p.then(
      (...args) => this.onSuccess<T>(...args, config, key, sourceItem),
      (...args) => this.onFail(...args, config, key, sourceItem)
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

  private onSuccess<T>(response: AxiosResponse<ResponseData<T>>, config: ICallBackAxiosConfig<T>, key: any, sourceItem: ISourceItem): void

  private onSuccess<T>(
    response: AxiosResponse<ResponseData<T>>,
    config: IPromiseAxiosConfig,
    key: any,
    sourceItem: ISourceItem
  ): IPromiseAxiosThenValue<T>

  private onSuccess<T>(
    response: AxiosResponse<ResponseData<T>>,
    config: IPromiseAxiosConfig | ICallBackAxiosConfig<T>,
    key: any,
    sourceItem: ISourceItem
  ): IPromiseAxiosThenValue<T> | void {
    this.removePendingSource(key, sourceItem)
    const { data } = response
    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing
    if ('onSuccess' in config) {
      return config.onSuccess(data, config, response)
    }
    return { response, data, config }
  }

  private onFail<T = any>(
    error: AxiosError<ResponseData>,
    config: ICallBackAxiosConfig<T>,
    key: any,
    sourceItem: ISourceItem
  ): Promise<never> | void

  private onFail(error: AxiosError<ResponseData>, config: IPromiseAxiosConfig, key: any, sourceItem: ISourceItem): Promise<never>

  private onFail<T = any>(
    error: AxiosError<ResponseData>,
    config: IPromiseAxiosConfig | ICallBackAxiosConfig<T>,
    key: any,
    sourceItem: ISourceItem
  ): Promise<never> | void {
    this.removePendingSource(key, sourceItem)
    if ('onFail' in config) {
      return config.onFail(error, config)
    }
    if (Axios.isCancel(error)) {
      if (!config.customErrorHandler) return PENDING
    }
    return Promise.reject({ error, config })
  }

  removePendingSource(key: string, sourceItem: ISourceItem) {
    const pendingSources = this.pendingSourceMap.get(key)!
    const fidx = pendingSources.indexOf(sourceItem)
    // 被cancel的source，在cancel时已从pendingSources中移除，fidx的值将为-1
    if (fidx > -1) {
      pendingSources.splice(fidx, 1)
    }
  }
}
