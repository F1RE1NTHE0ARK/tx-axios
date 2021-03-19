import { AxiosTransformer } from '../types'

export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
): any {
  //如果没有传处理函数则返回原配置
  if (!fns) {
    return data
  }
  //如果传入的是单个处理函数则转换为数组统一操作
  if (!Array.isArray(fns)) {
    fns = [fns]
  }
  //遍历函数数组，一次执行
  fns.forEach(fn => {
    //上一个函数的返回值作为下个函数的参数
    data = fn(data, headers)
  })
  return data
}
