// interface IOption {
//   immediately: boolean
// }

import share from './share'
import type { ISourceDescription } from './share'
import { EventNames } from './enum'

// class Loader{
//     status:string = STATUS.NOT_START
//     task
//     option:Partial<IOption>
//     constructor(loadSign,option){
//         this.option=option
//         if(this.option.immediately){
//             this.status=STATUS.PENDING
//         }
//         this.share.get(loadSign)

//     }
//     getTarget(){}
// }

export async function getItem(sign) {
  let source = share.getSharedItem(sign)
  if (!source) {
    source = await wait(sign)
  }
  return source.originData
}

async function wait(sign) {
  let cb: (source: ISourceDescription) => void
  const s = await new Promise<ISourceDescription>((resolve) => {
    cb = function (source) {
      if (source.sign === sign) {
        resolve(source)
      }
    }
    share.on(EventNames.LOADED, cb)
  })
  // 等事件队列中的回调全部完成后，再移除该cb
  // 防止在执行队列过程中，由于队列元素变化造成bug
  share.off(EventNames.LOADED, cb!)
  return s
}
