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