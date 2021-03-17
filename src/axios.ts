import { AxiosInstance,AxiosRequestConfig } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './default'
// 创建一个Axios实例
// 输出一个继承了Axios接口类型的AxiosInstance类型
function createInstance(config: AxiosRequestConfig): AxiosInstance {
  // 将默认参数传入Axios类构建函数
  const context = new Axios(config)
  // instance是一个函数，他其实就是Axios类上的request方法
  // 用bind是因为他要绑定Axios类的上下文来正确使用this
  const instance = Axios.prototype.request.bind(context)

  // 把所有context的示例属性和原型属性拷贝到instance中
  extend(instance, context)

  return instance as AxiosInstance
}
// 这时候调用axios()会默认调用Axios类的request方法
// 也可以调用axios.get(),因为instance拥有了Axios的所有实例方法

// 将默认参数传入Axios类构建函数
const axios = createInstance(defaults)

export default axios