import { AxiosRequestConfig } from './types'
import {bulidURL} from './helpers/url'
import {transformRequest} from './helpers/data'
import {processHeaders} from './helpers/headers'
import xhr from './xhr'

// 作为库的入口文件
function axios(config: AxiosRequestConfig): void {
  processConfig(config)
  xhr(config)
}
// 对config做处理
function processConfig (config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  config.headers = transformHeaders(config)
  config.data = transformRequestData(config)
}
// 对url和params做处理
function transformUrl (config: AxiosRequestConfig): string {
  const { url, params } = config
  return bulidURL(url, params)
}
// 对body做处理
function transformRequestData (config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

function transformHeaders (config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}
export default axios
