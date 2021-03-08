import { AxiosRequestConfig } from './types'
import xhr from './xhr'

// 作为库的入口文件
function axios(config: AxiosRequestConfig): void {
  xhr(config)
}
export default axios
