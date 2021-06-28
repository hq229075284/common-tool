import Request from './index'
import type { CustomConfig, AllowedRequestMethod, ResponseData } from './index'
import type { AxiosError } from 'axios'

type ConfigForPromiseHandle = Omit<CustomConfig, 'onSuccess' | 'onFail'>

// interface Data {
//   id: number
//   name: 'a' | 'b'
// }

export default class Ajax extends Request {
  // createAjax<T = any>(...args: [string, AllowedRequestMethod]) {
  createAjax<T, E>(...args: [string, AllowedRequestMethod]) {
    return (...others: [any, ConfigForPromiseHandle]) => {
      return (
        super
          // ._createAjax<T>(...args)(...others)
          ._createAjax<T>(...args)(...others)
          .then(
            (r) => {
              if (r) {
                // 请求成功
                console.log(r.message)
                return r
              }
            },
            (e: AxiosError<ResponseData<E>>) => {
              // 请求失败
              console.log(e.response.data.message)
              throw e
            }
          )
      )
    }
  }
}
