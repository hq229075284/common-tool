/**
 * 精度乘法
 * @param  {...number|string} args 乘数
 * @returns 乘积
 */
export function multiply(...args: (string | number)[]) {
  let length = 0
  const ints = args.map((arg) => {
    const argStr = String(arg)
    length += argStr.split('.')[1]?.length || 0
    return argStr.replace('.', '')
  })
  return ints.reduce((prev, int) => (prev *= +int), 1) / 10 ** length
}

/**
 * 精度加法
 * @param  {...number|string} args 加数
 * @returns 和
 */
export function add(...args: (string | number)[]) {
  const maxLength = args.reduce<number>((prev, arg) => {
    const argStr = String(arg)
    return Math.max(prev, argStr.split('.')[1]?.length || 0)
  }, 0)

  return (
    args
      .map((arg) => {
        const argStr = String(arg)
        const index = argStr.indexOf('.')
        if (index > -1) {
          return argStr.replace('.', '') + ''.padEnd(maxLength - (argStr.length - index - 1), '0')
        }
        return argStr + ''.padEnd(maxLength, '0')
      })
      .reduce<number>((prev, cur) => prev + Number(cur), 0) /
    10 ** maxLength
  )
}

/**
 * 精度减法
 * @param  {...number|string} args 被减数和减数们
 * @returns 差
 */
export function subtract(...args: (string | number)[]) {
  return add(args[0], ...args.slice(1).map((arg) => -arg))
}

/**
 * 小数转分数
 * @param {Number} decimal 小数
 * @returns
 */
export function floatToFraction(decimal) {
  const startTime = Date.now()
  const decimalLengthAfterDot = String(decimal).split('.')[1]?.length
  if (!decimalLengthAfterDot) return [decimal, 1]
  let numerator = decimal * 10 ** decimalLengthAfterDot // 初始化分子
  let denominator = 10 ** decimalLengthAfterDot // 初始化分母
  let divisor = numerator
  while (divisor >= 2) {
    if (Number.isInteger(numerator / divisor) && Number.isInteger(denominator / divisor)) {
      numerator /= divisor
      denominator /= divisor
      divisor = numerator
    } else {
      divisor -= 1
    }
    if (Date.now() - startTime > 1 * 1000) {
      console.warn('小数转分数计算超时')
      return [numerator, denominator]
    }
  }
  return [numerator, denominator]
}
