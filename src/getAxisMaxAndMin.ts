// #region 计算坐标轴的最大最小值
import { add, subtract, multiply, floatToFraction } from './arithmetic'

interface getIntervalParam {
  max: string | number
  min: string | number
  splitNumber: number
}
/**
 * 获取间距
 *
 * @param {getIntervalParam} param 间距参数
 * @return {*}  {number} 间距值
 */
function getInterval(param: getIntervalParam): number {
  const { max, min, splitNumber } = param
  return subtract(max, min) / splitNumber
}

interface IOption {
  max: number
  min: number
  splitNumber: number
  diffRange: number
  fixedLength: number
  showRatio: number
  zeroIsMin: boolean
}

/**
 *
 * @param option
 *  max 数值最大值
 *  min 数值最小值
 *  splitNumber 分割段数
 *  diffRange 数据变化幅度(0,1]
 *  fixedLength 数值保留小数位数
 *  showRatio 数据在图表上可显示的范围(0,1]
 *  zeroIsMin 当最小值为负数时，是否强制0为最小值
 * @returns { max:string, min:string, interval:number }
 */
export default function getAxisMaxAndMin(option: Partial<IOption> = {}): { max: number; min: number; interval: number } {
  // 参数检查
  const propertiesOfBooleanType = ['zeroIsMin']
  Object.entries(option).forEach(([key, value]) => {
    if (propertiesOfBooleanType.includes(key)) {
      if (typeof value !== 'boolean') {
        throw new Error(`${key}参数类型错误，请传入boolean类型的值`)
      }
      return
    }
    if (typeof value !== 'number') {
      throw new Error(`${key}参数类型错误，请传入number类型的值`)
    }
  })

  // 计算
  const { splitNumber = 5, diffRange = 0.5, fixedLength = 2, showRatio = 0.6, zeroIsMin = false } = option
  const { max = 5, min = 0 } = option
  const minInterval = 1 / 10 ** fixedLength

  let axisMax
  let axisMin
  if (min === max) {
    const val = min
    if (String(val).split('.')[1]?.length > fixedLength) {
      throw new Error(`最大最小等值时，该值：${val},应为${1 / 10 ** fixedLength}的整数倍`)
    }
    // 小数转分数
    const [n, m] = floatToFraction(multiply(splitNumber, showRatio) / 2)
    axisMin = subtract(val, multiply(minInterval, n))
    axisMax = add(axisMin, multiply(minInterval, splitNumber, m))

    if (zeroIsMin && axisMin < 0) {
      // axisMax = add(axisMax, Math.abs(axisMin))
      axisMin = 0
    }
  } else {
    axisMax = add(multiply(subtract(max, min), subtract(1, diffRange) / 2 / diffRange), max) || 0
    axisMin = subtract(min, multiply(subtract(max, min), subtract(1, diffRange) / 2 / diffRange)) || 0

    if (zeroIsMin && axisMin < 0) {
      // axisMax = add(axisMax, Math.abs(axisMin))
      axisMin = 0
    }

    // 运行到当前代码行，目前的axisMax和axisMin指的是渲染区中的

    axisMax = add(axisMin, subtract(axisMax, axisMin) / showRatio)
  }

  // 运行到当前代码行，目前的axisMax和axisMin指的是整个直角坐标系中的

  // 最小值无法被最小单位整除时，最小值应改取与当前最小值最接近的且小于当前最小值且能被最小单位长度整除的数
  if (String(axisMin).split('.')[1]?.length > fixedLength) {
    let offset = 0
    if (axisMin < 0) {
      // 当axisMin为负数时，需往负数变小的方向偏移1个最小单位
      offset = -minInterval
    }
    const matched = String(axisMin).match(new RegExp(`-\?\\d+\\.\\d{${fixedLength}}`))!
    axisMin = add(matched[0], offset)
  }

  // 计算最大最小值间隔能否被分段数整除，不能整除的情况下，以最小值为基准，往大的方向调整分段间隔和最大值
  const diffStr = String(subtract(axisMax, axisMin) / splitNumber)
  if (diffStr.split('.')[1]?.length > fixedLength) {
    const matched = diffStr.match(new RegExp(`\\d+\\.\\d{${fixedLength}}`))!
    axisMax = add(axisMin, multiply(splitNumber, add(matched[0], minInterval)))
  }

  let interval: string | number = String(getInterval({ max: axisMax, min: axisMin, splitNumber }))

  if (interval.split('.')[1]?.length > fixedLength) {
    const matched = interval.match(new RegExp(`\\d+\\.\\d{${fixedLength}}`))!
    interval = add(matched[0], minInterval)
    axisMax = add(axisMin, multiply(splitNumber, interval))
  } else {
    interval = +interval
  }

  return {
    max: axisMax,
    min: axisMin,
    interval,
  }
}

// #endregion

/**
 * 当渲染区减去波动区后的剩余长度是非渲染区的2倍时，符合公式：
 * diffRange = 3 + 2 / (-showRatio)
 */
