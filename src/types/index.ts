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
// 定义一个新接口
export interface Axios {

  interceptors:{
    request:AxiosInterceptorManager<AxiosRequestConfig>
    response:AxiosInterceptorManager<AxiosResponse>
  }

  // 包含方法，以下同
  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
}
// 定义接口，本身是一个函数，里面继承了Axios接口
export interface AxiosInstance extends Axios {
  defaults: any;
  (config: AxiosRequestConfig): AxiosPromise
  (url: string, config?: AxiosRequestConfig): AxiosPromise
}

export interface AxiosRequestConfig {
  //原来url必须穿到config里，现在可以传到get,post上（参考Axios接口）
  url?: string
  method?: Method
  headers?: any
  data?: any
  params?: any
  responseType?: XMLHttpRequestResponseType
  // type XMLHttpRequestResponseType = "" | "arraybuffer" | "blob" | "document" | "json" | "text"
  // 和请求数据类型类似
  timeout?: number
  [propName: string]: any
}

export interface AxiosResponse<T = any> {
  data: T
  // http状态码
  status: number
  // 状态信息
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {
  // 这里Promise泛型接口是interface Promise<T>
  // T代表resolve(T),即以后then(res=>...)中res的类型
}
// 这个Error定义在error.d.ts中
// export declare class Error {
//     name?: string;
//     message: string;
//     stack?: string;
//     constructor(message?: string);
// }
export interface AxiosError extends Error {
  // 请求配置
  config: AxiosRequestConfig
  // 报错信息
  code?: string
  // 请求参数
  request?: any
  // 响应数据
  response?: AxiosResponse
  // 是否为axios本身的错误
  isAxiosError: boolean
}

// 拦截器对外接口
// 接口有两个方法，user和eject
export interface AxiosInterceptorManager<T> {
  // use接收两个方法作为参数，并返回创建拦截器的id供eject时候用（number类型）
  // resovlved是ResolvedFn类型，可以选择作为请求或者是响应拦截器
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number

  eject(id: number): void
}
// 支持返回同步逻辑((val: T): T)，即return config什么的普通对象
// 支持返回异步逻辑( Promise<T>)
export interface ResolvedFn<T = any> {
  (val: T): T | Promise<T>
}
// error可能是任何类型的错误
export interface RejectedFn {
  (error: any): any
}