import { AxiosRequestConfig } from '../types'
import { isPlainObject ,deepMerge} from '../helpers/util'

const strats = Object.create(null)
// 默认合并方法
// val2不为空则返回val2，否则返回原值
function defaultStrat(val1: any, val2: any): any {
    return typeof val2 !== 'undefined' ? val2 : val1
}
// 传入的配置优先合并方法
// val2不为空返回val2，否则什么都不返回
function fromVal2Strat(val1: any, val2: any): any {
    if (typeof val2 !== 'undefined') {
        return val2
    }
}
// 深度合并
function deepMergeStrat(val1: any, val2: any): any {
    // 如果val2是对象
    if (isPlainObject(val2)) {
        return deepMerge(val1, val2)
    } else if (typeof val2 !== 'undefined') {
        return val2
        // 如果val2为空，val为对象
    } else if (isPlainObject(val1)) {
        return deepMerge(val1)
    } else if (typeof val1 !== 'undefined') {
        return val1
    }
}
const stratKeysDeepMerge = ['headers']

// 根据需求，headers配置要和传入的配置要深度合并
stratKeysDeepMerge.forEach(key => {
    strats[key] = deepMergeStrat
})
const stratKeysFromVal2 = ['url', 'params', 'data']

// 根据需求，url，params，data等配置是传入的配置优先覆盖
stratKeysFromVal2.forEach(key => {
    strats[key] = fromVal2Strat
})

// 合并请求配置
// 可以没有传入的配置，即返回原配置
export default function mergeConfig(
    config1: AxiosRequestConfig,
    config2?: AxiosRequestConfig
): AxiosRequestConfig {
    // 如果没有传入传入的配置，则为空配置
    if (!config2) {
        config2 = {}
    }

    const config = Object.create(null)

    // 对于传入的配置，都要合并到默认配置
    for (let key in config2) {
        mergeField(key)
    }
    for (let key in config1) {
        // 防止重复合并
        if (!config2[key]) {
            mergeField(key)
        }
    }
    // 合并辅助方法
    // 如果当前配置项（例如headers，url，params....）有分配合并方法则使用当前合并方法
    // 否则使用默认合并方法
    // 最后返回合并后配置
    function mergeField(key: string): void {
        const strat = strats[key] || defaultStrat
        config[key] = strat(config1[key], config2![key])
    }

    return config
}