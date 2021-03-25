import { AxiosRequestConfig, AxiosPromise, Method, AxiosResponse, ResolvedFn, RejectedFn } from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'
// 一个拦截器对象
interface Interceptors {
  // request里存了所有请求拦截器，类型为AxiosRequestConfig类型（即promise中resolve函数的参数的类型）
  // response里存了所有响应拦截器，类型为AxiosResponse类型（即promise中resolve函数的参数的类型）
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

// 链式调用数组接口
// 是一个包含拦截器和请求的对象
interface PromiseChain<T> {
  // 后面的是dispatchRequest的类型
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

// 定义了一个Axios类，他有很多实例方法，限制类型在src下的axios.ts中限制
export default class Axios {
  // 为Axios添加默认属性
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    // 初始化类时候传入配置
    this.defaults = initConfig
    // 初始化
    // 用的时候即axios.interceptors.request.user...
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    config = mergeConfig(this.defaults, config)
    config.method = config.method.toLowerCase()
    // 链式调用
    // 有一个发送请求的初始值
    const chain: PromiseChain<any>[] = [{
      resolved: dispatchRequest,
      rejected: undefined
    }]
    
    // 请求拦截器是先添加的后调用，所以要unshift
    // forEach是拦截器类里的遍历拦截器方法
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })
  // 响应拦截器是先添加的先调用，所以要push
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })
    // 初始值接收config参数给dispatchRequest执行请求
    let promise = Promise.resolve(config)
  
    // 如果拦截器中有
    while (chain.length) {
      // 断言chain不为空
      const { resolved, rejected } = chain.shift()!
      // 依次执行函数
      promise = promise.then(resolved, rejected)
    }
  
    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }
// 这个Method类型来自types下的index.ts
// 这个函数的作用是合并get和request的config参数
// 下面的函数多加了data
  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
