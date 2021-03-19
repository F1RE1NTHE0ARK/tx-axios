import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'
import xhr from './xhr'
import { bulidURL } from '../helpers/url'
import { processHeaders,flattenHeaders } from '../helpers/headers'
import  transform from './transform'

//这里使用transform函数依次执行transformRequest的函数
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  // 将传入的配置传入拉平
  config.headers = flattenHeaders(config.headers,config.method)
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
//   严格模式下url可能为undefined类型(AxiosRequestConfig里url是可选属性)
// 在这里我们可以确认url是肯定有的，所以用了类型断言，确保url不为空
  return bulidURL(url!, params)
}

//这个逻辑用不到了
//function transformRequestData(config: AxiosRequestConfig): any {
 // return transformRequest(config.data)
//}
//这个逻辑用不到了
//function transformHeaders(config: AxiosRequestConfig) {
//  const { headers = {}, data } = config
//  return processHeaders(headers, data)
//}

//这里使用transform函数依次执行transformResponse的函数
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}
// 改了个名字，没别的意义，只是为了模块化编程
export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
    processConfig(config)
    return xhr(config).then(res => {
      return transformResponseData(res)
    })
  }
