/* eslint-disable */
import Request, { PENDING } from './abstract'
import type { IPromiseAxiosConfig, AllowedRequestMethod, ResponseData } from './abstract'

// interface Data {
//   id: number
//   name: 'a' | 'b'
// }
const SUCCESS = 0

export default class Ajax extends Request {
  // createAjax<T = any>(...args: [string, AllowedRequestMethod]) {
  createAjax<T>(url: string, method: AllowedRequestMethod = 'POST') {
    const fn = (data: any, extraConfig?: IPromiseAxiosConfig) =>
      super
        ._createAjax<T>(url, method)(data, extraConfig)
        .then((r) => {
          if (r.data.status === SUCCESS) {
            return r.data.message
          }
          return Promise.reject(r)
        })
    return fn
  }
}
