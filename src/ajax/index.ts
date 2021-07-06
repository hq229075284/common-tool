import Request from './abstract'
import type { IBaseAXiosConfig, ICompleteAxiosConfig, AllowedRequestMethod, ResponseData } from './abstract'
import type { AxiosError } from 'axios'

// interface Data {
//   id: number
//   name: 'a' | 'b'
// }

export default class Ajax extends Request {
  // createAjax<T = any>(...args: [string, AllowedRequestMethod]) {
  createAjax<T>(url: string, method: AllowedRequestMethod = 'POST') {
    const fn = (...others: [any, IBaseAXiosConfig]) => {
      return super
        ._createAjax<T>(
          url,
          method
        )(...others)
        .then((r) => r.message)
    }
    return fn
  }
}
