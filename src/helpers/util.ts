const toString = Object.prototype.toString

// 类型谓词，指定val为Date类型
export function isDate (val: any): val is Date {
    // toSting.call()实际上就是 Object.prototype.toSting.call()
    // 用来判断类型（不能判断自定义类型，例person实例属于Person类）
    // typeof 不能准确判断一个对象变量，null 的结果也是 object，数组的结果也是 object，
  return toString.call(val) === '[object Date]'
}

export function isObject (val: any): val is Object {
  return val !== null && typeof val === 'object'
}
