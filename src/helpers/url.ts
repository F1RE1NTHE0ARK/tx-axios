// 引入工具函数
import { isDate, isPlainObject } from './util'

// 转码url，将@:$,+[]等特殊字符转换为原来的字符
function encode (val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

// 输出一个转换好的url
// 接收原始url字符串
// 接收一个任意类型的可选参数\
// 返回字符串url
export function bulidURL (url: string, params?: any):string {
// 如果没有参数则直接返回原始url 
  if (!params) {
    return url
  }
// 存放所有参数键值对的一个字符串数组
  const parts: string[] = []

//   遍历参数对象
  Object.keys(params).forEach((key) => {
    //   key是参数的名字
    //   参数的值
    let val = params[key]
    // 这里return会跳到下一个循环而不是跳出循环
    // 如果值是 null或者undefined
    if (val === null || typeof val === 'undefined') {
        // 不放入parts键值对数组中(将来拼接到url上)
      return
    }
    let values: string[]
    // 如果值是数组
    if (Array.isArray(val)) {
      values = val
    //   拼接，参考url数组类型
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach((val) => {
        // 如果是日期类型
      if (isDate(val)) {
        //   转换为日期，参考url日期类型
        val = val.toISOString()
        // 如果是对象类型
      } else if (isPlainObject(val)) {
        //   转换为json字符串，参考url对象类型
        val = JSON.stringify(val)
      }
    //   拼接成键值对，插入parts数组
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })
//   把所有参数变为&间隔形式的字符串，例:key1=value1&key2=value2&key3=value3
  let serializedParams = parts.join('&')

  if (serializedParams) {
    //   处理hash标识
    const markIndex = url.indexOf('#')
    // 如果有
    if (markIndex !== -1) {
        // 去掉hash标识
      url = url.slice(0, markIndex)
    }
    // 如果没有?号加上，如果有加一个&保留原来已有的参数
    // 再加上之后处理的其他参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}