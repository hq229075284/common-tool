import Request from '.'
import type { CustomConfig, AllowedRequestMethod } from '.'

type ConfigForPromiseHandle = Omit<CustomConfig, 'onSuccess' | 'onFail'>

export default class Ajax extends Request {
  createAjax(...args: [string, AllowedRequestMethod]) {
    return (...others: [any, ConfigForPromiseHandle]) => {
      return super
        .createAjax(...args)(...others)
        .then(
          (r) => {
            if (r) {
              console.log(r)
            }
          },
          (err) => {
            if (err) {
            }
          }
        )
    }
  }
}
