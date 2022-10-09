import share from './share'
import type { ISourceDescription } from './share'
import { EventNames, STATUS } from './enum'

export function registry(key: ISourceDescription['sign'], item) {
  const source = {
    sign: key,
    status: STATUS.COMPLETE,
    originData: item,
  }
  share.setSharedItem(key, source)
  share.emit(EventNames.LOADED, source)
}
