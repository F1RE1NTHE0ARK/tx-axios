import { isPlainObject } from './util'
// 对content-type字符串进行大小写转换，规范化
function normalizeHeaderName (headers: any, normalizedName: string): void {
    // 如果没有headers，什么都不做
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    // 如果原来的key值和规范化后的normalizedName期望值不同
    // 并且两者全部大写后相等
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        // 将原来的属性替换为规范化后的属性
      headers[normalizedName] = headers[name]
    //   删除原来的属性
      delete headers[name]
    }
  })
}

export function processHeaders (headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')
  
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
        // 有header但没有设置content-type则默认
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

// 把字符串的headers都变成对象
export function parseHeaders(headers: string): any {
  // parsed是个空对象
  let parsed = Object.create(null)
  // 如果headers是空的
  if (!headers) {
    // 直接返回对象
    return parsed
  }
  // 因为headers里所有键值对都是回车分割的
  headers.split('\r\n').forEach(line => {
    let [key, val] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      // 这里return还是跳到下个循环
      return
    }
    if (val) {
      val = val.trim()
    }
    parsed[key] = val
  })

  return parsed
}