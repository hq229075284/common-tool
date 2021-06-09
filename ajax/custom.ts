import Request from '.'
import type { CustomConfig, AllowedRequestMethod, responseData } from '.'
import { AxiosError } from 'axios'

type ConfigForPromiseHandle = Omit<CustomConfig, 'onSuccess' | 'onFail'>

export default class Ajax extends Request {
  createAjax(...args: [string, AllowedRequestMethod]) {
    return (...others: [any, ConfigForPromiseHandle]) => {
      return super
        .createAjax(...args)(...others)
        .then(
          (r) => {
            if (r) {
              // 请求成功
              console.log(r)
            }
          },
          (e: AxiosError<responseData>) => {
            // 请求失败
            console.log(e.message)
          }
        )
    }
  }
}
