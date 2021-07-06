# 工具集

## Ajax

```javascript
import { Ajax } from '@dc/common-tool'

const instance = new Ajax()
const createdApi = instance.createAjax('request/url', 'POST')

createdApi({ x: 1 }, { headers: { token: 'xxx' } }).then((message) => console.log(message))
```

## Cache

## socket
