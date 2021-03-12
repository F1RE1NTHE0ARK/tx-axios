// 公共类型文件
export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'Delete'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'

export interface AxiosRequestConfig {
  url: string
  method?: Method
  headers?:any
  data?: any
  params?: any
  responseType?: XMLHttpRequestResponseType
  // type XMLHttpRequestResponseType = "" | "arraybuffer" | "blob" | "document" | "json" | "text"
  // 和请求数据类型类似
  timeout?:number
}

export interface AxiosResponse {
  data: any
  // http状态码
  status: number
  // 状态信息
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

export interface AxiosPromise extends Promise<AxiosResponse> {
  // 这里Promise泛型接口是interface Promise<T>
  // T代表resolve(T),即以后then(res=>...)中res的类型
}