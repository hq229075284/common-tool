import Request from './abstract'
import type { IBaseAXiosConfig, AllowedRequestMethod, ResponseData } from './abstract'
import type { AxiosError } from 'axios'

// interface Data {
//   id: number
//   name: 'a' | 'b'
// }

export default class Ajax extends Request {
  // createAjax<T = any>(...args: [string, AllowedRequestMethod]) {
  createAjax<T>(...args: [url: string, method: AllowedRequestMethod]) {
    return (...others: [any, IBaseAXiosConfig]) => {
      return super._createAjax<T>(...args)(...others)
    }
  }
}
