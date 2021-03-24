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

  getUri(config?: AxiosRequestConfig): string
}
// 定义接口，本身是一个函数，里面继承了Axios接口
export interface AxiosInstance extends Axios {
  defaults: any;
  (config: AxiosRequestConfig): AxiosPromise
  (url: string, config?: AxiosRequestConfig): AxiosPromise
}


export interface AxiosClassStatic {
  new(config: AxiosRequestConfig): Axios
}


//新增了create方法
export interface AxiosStatic extends AxiosInstance {
  create(config?: AxiosRequestConfig): AxiosInstance
  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  isCancel: (value: any) => boolean

/*
 * all函数接受泛型T参数，接收一个T类型的数组或是Promise<T>【即resolve(T)】的数组为参数
 * 最后返回一个Promise<T[]>【即resolve(T[])】
*/
  all<T>(promises: Array<T | Promise<T>>): Promise<T[]>

/*spread函数接受两个泛型参数T，R
 * spread相当于一个高阶函数，接受一个函数参数，返回一个函数
 * 接受一个函数参数，此函数参数接受任意多个T类型数组解构的参数【注1】
 * 最后此函数参数返回一个R类型值
 * spread函数最后返回一个T类型的数组参数
 * 返回R类型的值
 */
  spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R

  Axios: AxiosClassStatic
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
  withCredentials?: boolean

  //他们接受AxiosTransformer类型，或者是此类型的数组
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]

  xsrfCookieName?: string
  xsrfHeaderName?: string

  onDownloadProgress?: (e: ProgressEvent) => void
  onUploadProgress?: (e: ProgressEvent) => void

  [propName: string]: any

  validateStatus?: (status: number) => boolean

  paramsSerializer?: (params: any) => string

  baseURL?: string

  auth?: AxiosBasicCredentials
}

export interface AxiosBasicCredentials {
  username: string
  password: string
}

export interface AxiosTransformer {
  (data: any, headers?: any): any
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

export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  throwIfRequested():void
}

export interface Canceler {
  (message?: string): void
}

export interface CancelExecutor {
  (cancel: Canceler): void
}

export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}

export interface CancelTokenStatic {
  new(executor: CancelExecutor): CancelToken

  source(): CancelTokenSource
}

export interface Cancel {
  message?: string
}

export interface CancelStatic {
  new(message?: string): Cancel
}

/*
 * 上面的解释说明【注1】
 * interface fuck<T> {
  (...args:T[]):string
}

let kk: fuck<number> = function (ww) {
  return 'sss'
}

let hi = []
kk(12, 24, 142)*/
