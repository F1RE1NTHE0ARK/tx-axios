import { AxiosRequestConfig , AxiosPromise,AxiosResponse} from './types'
import {parseHeaders, processHeaders} from './helpers/headers'
// 返回resolve值是AxiosResponse类型的Promise对象，
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve,reject) => {
    const { data = null, url, method = 'get', headers, responseType,timeout } = config

    const request = new XMLHttpRequest()

    // 获取服务器返回值
    if (responseType) {
      request.responseType = responseType
    }

    // 超时默认时间是0，永不超时
    if (timeout) {
      request.timeout = timeout
    }
    
    // ontimeout内置事件
    request.ontimeout = function handleTimeout() {
      reject(new Error(`Timeout of ${timeout} ms exceeded`))
    }

    request.open(method.toUpperCase(), url, true)

    // 请求状态变化监听器
    request.onreadystatechange = function handleLoad() {
      // 0	UNSENT	代理被创建，但尚未调用 open() 方法。
      // 1	OPENED	open() 方法已经被调用。
      // 2	HEADERS_RECEIVED	send() 方法已经被调用，并且头部和状态已经可获得。
      // 3	LOADING	下载中； responseText 属性已经包含部分数据。
      // 4	DONE	下载操作已完成。
      if (request.readyState !== 4) {
        // 如果连接没完成则直接返回
        return
      }

      // 网络超时和连接错误时都为状态码都为0
      if (request.status === 0) {
        return
      }
      // getAllResponseHeaders()方法返回所有的响应头
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      // 这个只是字段不同
      const responseData = responseType && responseType !== 'text' ? request.response : request.responseText

      // 最终返回数据
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
    }
    // 处理网络错误
    request.onerror = function handleError() {
      reject(new Error('Network Error'))
    }
    Object.keys(headers).forEach((name) => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    request.send(data)

    function handleResponse(response: AxiosResponse) {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(new Error(`Request failed with status code ${response.status}`))
      }
    }
  })
}