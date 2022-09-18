const collection = new Map()
function isSimpleType(val) {
  return typeof val !== 'object' || val === null
}
function isArray(val) {
  return Object.prototype.toString.call(val) === '[object Array]'
}
// function isPlainObject(val) {
//   return Object.prototype.toString.call(val) === '[object Object]'
// }
function traverse(source: any, handle: Function = defaultHandle, path: string[] = []) {
  if (isSimpleType(source)) return handle(source, path)
  if (collection.has(source)) return collection.get(source)
  if (isArray(source)) {
    const result: any[] = []
    collection.set(source, result)
    source.forEach((item, index) => {
      result[index] = traverse(item, handle, path.concat([index]))
    })
    return result
  } else {
    // object
    const result = {}
    collection.set(source, result)
    Object.keys(source).forEach((key) => {
      result[key] = traverse(source[key], handle, path.concat([key]))
    })
    return result
  }
}

function defaultHandle(val: any, path: string[]) {
  return val
}

export default traverse
