const toString = Object.prototype.toString

// 类型谓词，指定val为Date类型
export function isDate (val: any): val is Date {
    // toSting.call()实际上就是 Object.prototype.toSting.call()
    // 用来判断类型（不能判断自定义类型，例person实例属于Person类）
    // typeof 不能准确判断一个对象变量，null 的结果也是 object，数组的结果也是 object，
  return toString.call(val) === '[object Date]'
}
export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
}
/*export function isObject (val: any): val is Object {
  return val !== null && typeof val === 'object'
}*/

// 普通对象
export function isPlainObject (val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

// 混合对象（一个泛型接口）
// 作用是将from的所有属性拷贝到to中
// 输出交叉类型
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    // 因为to是合并后的类型，他也必须符合U类型，所以要进行断言
    // 如果不写from[key] as any则无法赋值一个U类型给交叉类型T U
    // 如果括号开头的语句不加分号，那么代码压缩后合并到一行后非常容易变成一个函数的调用了，
    // 所以需要加分号。另外以 +、-、/、()、[] 这些字符开头的语句，都需要加分号
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}


// 深拷贝（其实就是合并对象里所有的键）
// 接收一个或多个参数，最后返回合并的对象
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)
// 遍历参数
  objs.forEach(obj => {
    if (obj) {
      // 遍历对象的键
      Object.keys(obj).forEach(key => {
        // 对应对象的键的值
        const val = obj[key]
        // 如果此值是个对象
        if (isPlainObject(val)) {
          // 判断result对应的键值对是否是对象
          if (isPlainObject(result[key])) {
            // 是则重复执行合并对象操作（递归）
            result[key] = deepMerge(result[key], val)
          } else {
            // 否则直接赋值
            result[key] = deepMerge({}, val)
          }
        } else {
          // 否则直接设置合并对象的键值对
          result[key] = val
        }
      })
    }
  })

  return result
}

export function isFormData(val: any): boolean {
  return typeof val !== 'undefined' && val instanceof FormData
}
