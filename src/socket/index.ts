type cbQueueName = 'errorCbs'
class Socket {
  liveMessage = 'live'
  socket: WebSocket
  errorCbs: Array<() => any> = []
  constructor(socketUrl: string) {
    // socketUrl = 'wss://web.dcyun.com:48348/api/websocket/10'
    const socket = (this.socket = new WebSocket(socketUrl))
    // 打开事件
    socket.onopen = this.onOpen.bind(this)
    // 获得消息事件
    socket.onmessage = this.onMessage.bind(this)
    // 关闭事件
    socket.onclose = this.onClose.bind(this)
    // 发生了错误事件
    socket.onerror = this.onError.bind(this)
  }

  // socket回调处理
  onOpen() {
    console.log('websocket已连接')
    this.detectLive()
  }
  onMessage() {
    this.detectLive()
    /* some other code */
  }
  onClose() {
    console.log('websocket已关闭')
  }
  onError() {
    console.log('websocket发生了错误')
    this.errorCbs.forEach((fn) => fn())
  }

  // 心跳
  detectTimer: number
  deadTimer: number
  detectLive() {
    clearTimeout(this.detectTimer)
    clearTimeout(this.deadTimer)
    this.detectTimer = window.setTimeout(() => {
      this.socket.send(this.liveMessage)
      this.deadTimer = window.setTimeout(() => {
        this.socket.close()
        this.onError()
      }, 5000)
    }, 10000)
  }

  // 监听事件
  on(event: string, fn: () => void) {
    this[event + 'Cbs'].push(fn)
  }
  off(event: string, fn: () => void) {
    const propertyName = (event + 'Cbs') as cbQueueName
    if (fn) {
      const fidx = this[propertyName].indexOf(fn)
      if (~fidx) {
        this[propertyName].splice(fidx, 1)
      }
    } else {
      this[propertyName] = []
    }
  }
}
