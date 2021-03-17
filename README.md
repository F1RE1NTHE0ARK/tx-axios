# tx-axios

写一个typescript的axios

# 初始化

初始化了项目

# 实现的功能

```typescript
axios({
  method: 'get',
  url: '/simple/get',
  params: {
    a: 1,
    b: 2
  }
})
```

# 入口文件

- 在src下创建index.ts

``` typescript
// 作为库的入口文件
function axios(config){
	// ...todo
}
export default axios;
```

# 公共类型

- 在src下创建types文件夹，并创建index.ts文件

``` typescript
// 公共类型文件
export type Method = 'get' | 'GET' | 'delete' | 'Delete' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'

export interface AxiosRequestConfig{
    url:string
    method?:Method
    data?:any
    params?:any
}
```

入口文件引入

``` typescript
import {AxiosRequestConfig} from './types'

function axios(config:AxiosRequestConfig){
...
```

# 创建xhr请求模块

- 在src下创建xhr.ts文件

``` typescript
import {AxiosRequestConfig} from './types'
export default function xhr(config:AxiosRequestConfig):void{
    // 结构
    const {data =null,url,method='get'} = config
    const request = new XMLHttpRequest()
  	// 参数： https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/open#%E5%8F%82%E6%95%B0
    request.open(method.toUpperCase(),url,true)
    //如果是异步请求（默认为异步请求），则此方法会在请求发送后立即返回；如果是同步请求，则此方法直到响应到达后才会返回。
    request.send(data)
}
```

改写入口文件

``` typescript
import {AxiosRequestConfig} from './types'
import xhr from './xhr'

// 作为库的入口文件
function axios(config:AxiosRequestConfig):void{
    xhr(config)
}
export default axios;
```

## 安装编写demo的依赖

```diff
+"webpack": "^4.28.4",
+"webpack-dev-middleware": "^3.5.0",
+"webpack-hot-middleware": "^2.24.3",
+"ts-loader": "^5.3.3",
+"tslint-loader": "^3.5.4",
+"express": "^4.16.4",
+"body-parser": "^1.18.3"
```

> npm install webpack -D
>
> npm install webpack-dev-middleware -D
>
> npm install webpack-hot-middleware -D
>
> npm install ts-loader -D
>
> npm install tslint tslint-loader -D
>
> npm install express -D
>
> npm install body-parser -D

## 编写demo文件

参考手册

# 处理url参数

- 在src下创建helpers文件夹，创建url.ts（返回处理后的url）和util.ts（保存一些公共方法，比如判断类型）

- url参数可能出现的情况：

``` typescript
//参数值为数组
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: ['bar', 'baz']
  }
})

//参数值为对象
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
})
最终请求的 url 是 /base/get?foo=%7B%22bar%22:%22baz%22%7D，foo 后面拼接的是 {"bar":"baz"} encode 后的结果。

//参数值为 Date 类型
const date = new Date()

axios({
  method: 'get',
  url: '/base/get',
  params: {
    date
  }
})
最终请求的 url 是 /base/get?date=2019-04-01T05:55:39.030Z，date 后面拼接的是 date.toISOString() 的结果。

//特殊字符支持
对于字符 @、:、$、,、、[、]，我们是允许出现在 url 中的，不希望被 encode。

axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: '@:$, '
  }
})
最终请求的 url 是 /base/get?foo=@:$+，注意，我们会把空格 转换成 +。

//空值忽略
对于值为 null 或者 undefined 的属性，我们是不会添加到 url 参数中的。

axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'bar',
    baz: null
  }
})
最终请求的 url 是 /base/get?foo=bar。

//丢弃 url 中的哈希标记
axios({
  method: 'get',
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
})
最终请求的 url 是 /base/get?foo=bar

//保留 url 中已存在的参数
axios({
  method: 'get',
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
})
最终请求的 url 是 /base/get?foo=bar&bar=baz

```

``` typescript
//url.ts
// 引入工具函数
import { isDate, isPlainObject } from './util'

// 转码url，将@:$,+[]等特殊字符转换为原来的字符
function encode (val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

// 输出一个转换好的url
// 接收原始url字符串
// 接收一个任意类型的可选参数\
// 返回字符串url
export function bulidURL (url: string, params?: any):string {
// 如果没有参数则直接返回原始url 
  if (!params) {
    return url
  }
// 存放所有参数键值对的一个字符串数组
  const parts: string[] = []

//   遍历参数对象
  Object.keys(params).forEach((key) => {
    //   key是参数的名字
    //   参数的值
    let val = params[key]
    // 这里return会跳到下一个循环而不是跳出循环
    // 如果值是 null或者undefined
    if (val === null || typeof val === 'undefined') {
        // 不放入parts键值对数组中(将来拼接到url上)
      return
    }
    let values: string[]
    // 如果值是数组
    if (Array.isArray(val)) {
      values = val
    //   拼接，参考url数组类型
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach((val) => {
        // 如果是日期类型
      if (isDate(val)) {
        //   转换为日期，参考url日期类型
        val = val.toISOString()
        // 如果是对象类型
      } else if (isPlainObject(val)) {
        //   转换为json字符串，参考url对象类型
        val = JSON.stringify(val)
      }
    //   拼接成键值对，插入parts数组
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })
//   把所有参数变为&间隔形式的字符串，例:key1=value1&key2=value2&key3=value3
  let serializedParams = parts.join('&')

  if (serializedParams) {
    //   处理hash标识
    const markIndex = url.indexOf('#')
    // 如果有
    if (markIndex !== -1) {
        // 去掉hash标识
      url = url.slice(0, markIndex)
    }
    // 如果没有?号加上，如果有加一个&保留原来已有的参数
    // 再加上之后处理的其他参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}
```

``` typescript
// util.ts
const toString = Object.prototype.toString

// 类型谓词，指定val为Date类型
export function isDate (val: any): val is Date {
    // toSting.call()实际上就是 Object.prototype.toSting.call()
    // 用来判断类型（不能判断自定义类型，例person实例属于Person类）
    // typeof 不能准确判断一个对象变量，null 的结果也是 object，数组的结果也是 object，
  return toString.call(val) === '[object Date]'
}

export function isObject (val: any): val is Object {
  return val !== null && typeof val === 'object'
}

// 判断是否为普通对象,因为formdata，ArrayBuffer等也是对象，但不是普通对象
export function isPlainObject (val: any): val is Object {
  return toString.call(val) === '[object Object]'
}
```

## 改造之前的入口文件

``` typescript
import { AxiosRequestConfig } from './types'
import {bulidURL} from './helpers/url'
import xhr from './xhr'

// 作为库的入口文件
function axios(config: AxiosRequestConfig): void {
  processConfig(config)
  xhr(config)
}
// 对config做处理
function processConfig (config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
}
// 对url和params做处理
function transformUrl (config: AxiosRequestConfig): string {
  const { url, params } = config
  return bulidURL(url, params)
}

export default axios

```

## 编写demo文件

参考手册

# 处理body参数

我们通过执行 `XMLHttpRequest` 对象实例的 `send` 方法来发送请求，并通过该方法的参数设置请求 `body` 数据，我们可以去 [mdn](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send) 查阅该方法支持的参数类型。

我们发现 `send` 方法的参数支持 `Document` 和 `BodyInit` 类型，`BodyInit` 包括了 `Blob`, `BufferSource`, `FormData`, `URLSearchParams`, `ReadableStream`、`USVString`，当没有数据的时候，我们还可以传入 `null`。



JSON字符串属于USVString



- 在helpers下创建data.ts

``` typescript
import {isPlainObject} from './util'

//处理body的data数据，如果是普通对象，则转换为JSON字符串
export function transformRequest(data:any):any{
    if(isPlainObject(data)){
       return JSON.stringify(data)
    }
    return data;
}
```

- src的index.ts下添加方法

``` typescript
import {transformRequest} from './helpers/data'
...
// 对config的data做处理
function processConfig (config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transformRequestData(config)
}
// 对body做处理
function transformRequestData (config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}
```

## 编写demo文件

参考文档

# 处理header

- 在helpers下创建headers.ts

``` typescript
import { isPlainObject } from './util'
// 对content-type字符串进行大小写转换，规范化
function normalizeHeaderName (headers: any, normalizedName: string): void {
    // 如果没有headers，什么都不做
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    // 如果原来的key值和规范化后的normalizedName期望值不同
    // 并且两者全部大写后相等
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        // 将原来的属性替换为规范化后的属性
      headers[normalizedName] = headers[name]
    //   删除原来的属性
      delete headers[name]
    }
  })
}

export function processHeaders (headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')
  
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
        // 有header但没有设置content-type则默认
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}
```

- 改写入口文件

``` typescript
import {processHeaders} from './helpers/headers'
...
// 对config做处理
function processConfig (config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  //先处理headers是因为处理data时会把普通对象转换为JSON字符串
  config.headers = transformHeaders(config)
  config.data = transformRequestData(config)
}
...
function transformHeaders (config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}
```

- 修改xhr.ts

``` typescript
...
request.open(method.toUpperCase(), url, true)
Object.keys(headers).forEach((name) => {
    // 如果没数据，则content-type没有意义
    if (data === null && name.toLowerCase() === 'content-type') {
      delete headers[name]
    } else {
      request.setRequestHeader(name, headers[name])
    }
  })
request.send(data)
```

## 编写demo文件

- base里的app.ts

``` typescript
axios({
  method: 'post',
  url: '/base/post',
  data: {
    a: 1,
    b: 2
  }
})

axios({
  method: 'post',
  url: '/base/post',
  headers: {
    'content-type': 'application/json;charset=utf8',
    'Accept':'application/json,text/plain'
  },
  data: {
    a: 1,
    b: 2
  }
})

const paramsString = 'q=URLUtils.searchParams&topic=api'
const searchParams = new URLSearchParams(paramsString)

axios({
  method: 'post',
  url: '/base/post',
  data: searchParams
})
```

# 获取响应数据

我们已经可以在开发者里看到响应数据，现在要代码内拿到数据

## 需求

```typescript
axios({
  method: 'post',
  url: '/base/post',
  data: {
    a: 1,
    b: 2
  }
}).then((res) => {
  //我们想要在这里拿到返回值
  console.log(res)
})
```

- 在type中index.ts中

``` typescript
...
export interface AxiosRequestConfig {
  ...
  responseType?: XMLHttpRequestResponseType
  // type XMLHttpRequestResponseType = "" | "arraybuffer" | "blob" | "document" | "json" | "text"
  // 和请求数据类型类似
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
```

- 改造xhr.ts

``` typescript
import { AxiosRequestConfig , AxiosPromise,AxiosResponse} from './types'
// 返回resolve值是AxiosResponse类型的Promise对象，
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve) => {
    const { data = null, url, method = 'get', headers, responseType } = config

    const request = new XMLHttpRequest()

    // 获取服务器返回值
    if (responseType) {
      request.responseType = responseType
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
      // getAllResponseHeaders()方法返回所有的响应头
      const responseHeaders = request.getAllResponseHeaders()
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
      resolve(response)
    }

    Object.keys(headers).forEach((name) => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    request.send(data)
  })
}
```

- src下的index.ts

``` typescript
...
// 作为库的入口文件
function axios(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  // 返回一个promise对象
  return xhr(config)
}
...
```

## 编写demo文件

# 处理响应header

## 需求

```json
//原先
'date: Fri, 05 Apr 2019 12:40:49 GMT /r/n etag: W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k" /r/n connect...'
//输出
{
  date: 'Fri, 05 Apr 2019 12:40:49 GMT'
  etag: 'W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k"',
  connection: 'keep-alive',
  'x-powered-by': 'Express',
  'content-length': '13'
  'content-type': 'application/json; charset=utf-8'
}
```

- helpers下的headers.ts

``` typescript
// 把字符串的headers都变成对象
export function parseHeaders(headers: string): any {
  // parsed是个空对象
  let parsed = Object.create(null)
  // 如果headers是空的
  if (!headers) {
    // 直接返回对象
    return parsed
  }
  // 因为headers里所有键值对都是回车分割的
  headers.split('\r\n').forEach(line => {
    let [key, val] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      // 这里return还是跳到下个循环
      return
    }
    if (val) {
      val = val.trim()
    }
    parsed[key] = val
  })

  return parsed
}
```

- xhr.ts

``` typescript
...
// getAllResponseHeaders()方法返回所有的响应头
const responseHeaders = parseHeaders(request.getAllResponseHeaders())
...
```

# 处理响应data

有时候响应数据默认是字符串，需要转换为json字符串

- helper下的data.ts

``` typescript
export function transformResponse(data: any): any {
    if (typeof data === 'string') {
      try {
        //转换为json字符串
        data = JSON.parse(data)
      } catch (e) {
        // do nothing
      }
    }
    return data
  }
```

- src下的index.ts

``` typescript
...
function axios(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  // 返回一个promise对象
  return xhr(config).then((res) => {
    // 将返回的数先转换一下
    return transformResponseData(res)
  })
}
...
```

# 处理异常错误

## 需求

1. 网络错误
2. 超时错误
3. 非200响应错误

## 处理

- types下index.ts

``` typescript
...
export interface AxiosRequestConfig {
  ...
  timeout?:number
}
```

- xhs.ts

``` typescript
// 返回resolve值是AxiosResponse类型的Promise对象，
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve,reject) => {
      //添加timeout变量
    const { data = null, url, method = 'get', headers, responseType,timeout } = config
...

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
      ...

      // 网络超时和连接错误时都为状态码都为0
      if (request.status === 0) {
        return
      }
      ...
      handleResponse(response)
    }
    // 处理网络错误
    request.onerror = function handleError() {
      reject(new Error('Network Error'))
    }
    ...
    //这个函数用来出来返回数据
    //状态码不正常则丢出错误
    function handleResponse(response: AxiosResponse) {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(new Error(`Request failed with status code ${response.status}`))
      }
    }
  })
}
```

## 测试demo

- examples下创建error

- 其他参考文档

# 增强报错信息

## 需求

其实就是把除了报错码外的其他你传的东西再丢回来

- types/index.ts

``` typescript
...
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
```

- helpers/error.ts

> 这个工厂函数只是拓展了原来的Error类

``` typescript
//重新创建一个接口也是可以的
interface AxiosErrorType extends Error{
  isAxiosError:boolean,
  config:AxiosRequestConfig,
  code?:string|null,
  request?:any,
  response?:AxiosResponse
}
class AxiosError extends Error implements AxiosErrorType{
	//...
}
function createError():AxiosErrorType{
	return new AxiosError(message,config,request,response)
}
```



``` typescript
import { AxiosRequestConfig, AxiosResponse } from '../types'

export class AxiosError extends Error {
    // 公共实例属性
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse

  constructor(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    request?: any,
    response?: AxiosResponse
  ) {
    //   继承Error的message
    super(message)

    this.config = config
    this.code = code
    this.request = request
    this.response = response
    this.isAxiosError = true
    // 这个是让原来的Error类生效
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AxiosError.prototype)
  }
}

export function createError(
  message: string,
  config: AxiosRequestConfig,
  code?: string | null,
  request?: any,
  response?: AxiosResponse
): AxiosError {
  const error = new AxiosError(message, config, code, request, response)

  return error
}
```

# 拓展接口

为了用户更加方便地使用 axios 发送请求，我们可以为所有支持请求方法扩展一些接口：

`axios.request(config)`
`axios.get(url[, config])`
...

- types/index.ts

``` typescript
...
export interface Axios {
  // 包含方法，以下同
  request(config: AxiosRequestConfig): AxiosPromise

  get(url: string, config?: AxiosRequestConfig): AxiosPromise

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise

  head(url: string, config?: AxiosRequestConfig): AxiosPromise

  options(url: string, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
}
// 定义接口，本身是一个函数，里面继承了Axios接口
export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise
}

export interface AxiosRequestConfig {
...
```

- src下新建core文件夹Axios.ts

``` typescript
import { AxiosRequestConfig, AxiosPromise, Method } from '../types'
import dispatchRequest from './dispatchRequest'
// 定义了一个Axios类，他有很多实例方法，限制类型在src下的axios.ts中限制
export default class Axios {
  request(config: AxiosRequestConfig): AxiosPromise {
    return dispatchRequest(config)
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
```

- core下dispatchRequest.ts，用来执行请求动作（把原来src下的axios.ts拷贝进来）

``` typescript
...
function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
//   严格模式下url可能为undefined类型(AxiosRequestConfig里url是可选属性)
// 在这里我们可以确认url是肯定有的，所以用了类型断言，确保url不为空
  return bulidURL(url!, params)
}
...
// 改了个名字，没别的意义，只是为了模块化编程
export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
    processConfig(config)
    return xhr(config).then(res => {
      return transformResponseData(res)
    })
  }
```

- helpers/util.ts

``` typescript
// 混合对象（一个泛型接口）
// 作用是将from的所有属性拷贝到to中
// 输出交叉类型
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    // 因为to是合并后的类型，他也必须符合U类型，所以要进行断言
    // 如果不写from[key] as any则无法赋值一个U类型给交叉类型T U
    // 如果括号开头的语句不加分号，那么代码压缩后合并到一行后非常容易变成一个函数的调用了，
    // 所以需要加分号。另外以 +、-、/、()、[] 这些字符开头的语句，都需要加分号
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}
```

- 原src下的axios.ts

``` typescript
import { AxiosInstance } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'

// 创建一个Axios实例
// 输出一个继承了Axios接口类型的AxiosInstance类型
function createInstance(): AxiosInstance {
  const context = new Axios()
  // instance是一个函数，他其实就是Axios类上的request方法
  // 用bind是因为他要绑定Axios类的上下文来正确使用this
  const instance = Axios.prototype.request.bind(context)

  // 把所有context的示例属性和原型属性拷贝到instance中
  extend(instance, context)

  return instance as AxiosInstance
}
// 这时候调用axios()会默认调用Axios类的request方法
// 也可以调用axios.get(),因为instance拥有了Axios的所有实例方法
const axios = createInstance()

export default axios
```

- core下xhr.ts（原来在src下）

``` typescript
...
// 同样这里url也是可以确保有的所以加了类型断言
    request.open(method.toUpperCase(), url!, true)

...
```

- server.js

``` typescript
router.get('/extend/get',function(req,res){
  res.json({
    msg:'hello world'
  })
})
router.options('/extend/options',function(req,res){
  res.end
})
router.delete('/extend/delete',function(req,res){
  res.end
})

router.head('/extend/head',function(req,res){
  res.end
})
router.post('/extend/post',function(req,res){
  res.json(req.body)
})
router.put('/extend/put',function(req,res){
  res.json(req.body)
})
router.patch('/extend/patch',function(req,res){
  res.json(req.body)
})
```



# 实现参数可选

## 需求

利用函数重载让参数变成可选

``` typescript
axios({
  url: '/extend/post',
  method: 'post',
  data: {
    msg: 'hi'
  }
})

axios('/extend/post', {
  method: 'post',
  data: {
    msg: 'hello'
  }
})
```

- types/index.ts

```typescript
export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise
//++
  (url: string, config?: AxiosRequestConfig): AxiosPromise
}
```

- core/Axios.ts

``` typescript
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    return dispatchRequest(config)
  }
```

## 编写demo

同需求，在extend/app.ts

# 为响应数据定义泛型接口

不知道有什么用...

# 拦截器

## 需求

> 可以在发送前和响应后执行特定的多个操作

``` typescript
axios.interceptors.request.use(function (config) {
  // 在发送请求之前可以做一些事情
  config.header.text+='额外东东'
  return config;
}, function (error) {
  // 处理请求错误
  return Promise.reject(error);
});
// 添加一个响应拦截器
axios.interceptors.response.use(function (response) {
  // 处理响应数据
  response.data.text+='额外东东'
  return response;
}, function (error) {
  // 处理响应错误
  return Promise.reject(error);
});
```

> 可以去掉拦截器

```typescript
const myInterceptor = axios.interceptors.request.use(function () {/*...*/})
axios.interceptors.request.eject(myInterceptor)
```

- types/index.ts

``` typescript
// 定义一个新接口
export interface Axios {
//添加接口
  interceptors:{
    request:AxiosInterceptorManager<AxiosRequestConfig>
    response:AxiosInterceptorManager<AxiosResponse>
  }
	...
}
...
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
```

- core下interceptorManager.ts

``` typescript
import { ResolvedFn, RejectedFn } from '../types'

// 拦截器类型是一个对象，对象内有两个方法
interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> {
    // 这里是存储所有拦截器的数组，可以是拦截器类型，也可以是null（即某个拦截器给eject掉时）类型
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    //   初始化
    this.interceptors = []
  }
// 调用use实例方法时，往拦截器数组添加拦截器，并以拦截器长度来做id
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    // 拦截器长度来做id
    return this.interceptors.length - 1
  }
// 调用forEach方法时接收一个方法作为参数（拦截器内部用）
// 遍历所有拦截器，然后用接收的方法去执行这个拦截器
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }
// 调用eject实例方法时，将拦截器数组里的指定id拦截器清除
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
```

- core下Axios.ts

``` typescript
...
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

  interceptors: Interceptors

  constructor() {
    // 初始化
    // 用的时候即axios.interceptors.request.user...
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
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
...
}
```

## 编写demo

- server.js

``` typescript
...
router.get('/interceptor/get',function(req,res){
  res.end('hello')
})
```

## 调用步骤

``` typescript
//初始化了拦截器数组为发送请求拦截器
const chain: PromiseChain<any>[] = [{
    resolved: dispatchRequest,
    rejected: undefined
}]
```

``` typescript
//添加拦截器，这里只传了use里的resolve参数，reject是可选的
//作用是向拦截器数组中添加拦截器
axios.interceptors.request.use(config => {
  config.headers.test += '1'
  return config
})
...
axios.interceptors.response.use(res => {
  res.data += '1'
  return res
})
```

``` typescript
//通过InterceptorManager下的forEach为拦截器数组添加拦截器数组
//形成拦截器链式调用链
this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
})
...
```

``` typescript
//interceptor下app.ts
//调用axios触发请求请求
//axios为core下的Axios类创建的实例
axios({
  url: '/interceptor/get',
 ...
}))
```

``` typescript
//Axios下request函数开始发送请求
let promise = Promise.resolve(config)

//并按照拦截器数组顺序调用拦截器
while (chain.length) {
   const { resolved, rejected } = chain.shift()!
   promise = promise.then(resolved, rejected)
}
```

# 合并配置

## 需求

可以添加默认配置

```typescript
axios.defaults.headers.common['test'] = 123
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.timeout = 2000
```

- src下defaults.ts

``` typescript
import { AxiosRequestConfig } from './types'
// 默认请求配置
const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  }
}

const methodsNoData = ['delete', 'get', 'head', 'options']
// 这里为headers添加其他不需要请求参数的请求方法默认配置
methodsNoData.forEach(method => {
  defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']
// 这里为headers添加其他需要请求参数的请求方法默认配置
methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
```

- core下的Axios.ts

``` typescript
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
...
    config = mergeConfig(this.defaults, config)
	...
 }
```

- types下的axios.ts

``` typescript
function createInstance(config: AxiosRequestConfig): AxiosInstance {
  // 将默认参数传入Axios类构建函数
  const context = new Axios(config)
  ...
}
// 将默认参数传入Axios类构建函数
const axios = createInstance(defaults)
```

- core下mergeConfig.ts

``` typescript
import { AxiosRequestConfig } from '../types'
import { isPlainObject ,deepMerge} from '../helpers/util'

const strats = Object.create(null)
// 默认合并方法
// val2不为空则返回val2，否则返回原值
function defaultStrat(val1: any, val2: any): any {
    return typeof val2 !== 'undefined' ? val2 : val1
}
// 传入的配置优先合并方法
// val2不为空返回val2，否则什么都不返回
function fromVal2Strat(val1: any, val2: any): any {
    if (typeof val2 !== 'undefined') {
        return val2
    }
}
// 深度合并
function deepMergeStrat(val1: any, val2: any): any {
    // 如果val2是对象
    if (isPlainObject(val2)) {
        return deepMerge(val1, val2)
    } else if (typeof val2 !== 'undefined') {
        return val2
        // 如果val2为空，val为对象
    } else if (isPlainObject(val1)) {
        return deepMerge(val1)
    } else if (typeof val1 !== 'undefined') {
        return val1
    }
}
const stratKeysDeepMerge = ['headers']

// 根据需求，headers配置要和传入的配置要深度合并
stratKeysDeepMerge.forEach(key => {
    strats[key] = deepMergeStrat
})
const stratKeysFromVal2 = ['url', 'params', 'data']

// 根据需求，url，params，data等配置是传入的配置优先覆盖
stratKeysFromVal2.forEach(key => {
    strats[key] = fromVal2Strat
})

// 合并请求配置
// 可以没有传入的配置，即返回原配置
export default function mergeConfig(
    config1: AxiosRequestConfig,
    config2?: AxiosRequestConfig
): AxiosRequestConfig {
    // 如果没有传入传入的配置，则为空配置
    if (!config2) {
        config2 = {}
    }

    const config = Object.create(null)

    // 对于传入的配置，都要合并到默认配置
    for (let key in config2) {
        mergeField(key)
    }
    for (let key in config1) {
        // 防止重复合并
        if (!config2[key]) {
            mergeField(key)
        }
    }
    // 合并辅助方法
    // 如果当前配置项（例如headers，url，params....）有分配合并方法则使用当前合并方法
    // 否则使用默认合并方法
    // 最后返回合并后配置
    function mergeField(key: string): void {
        const strat = strats[key] || defaultStrat
        config[key] = strat(config1[key], config2![key])
    }

    return config
}
```

- 修改types下index.ts

``` typescript
export interface AxiosRequestConfig {
  ...
  [propName: string]: any
}
```

- util.ts添加深拷贝方法

``` typescript
// 深拷贝（其实就是合并对象里所有的键）
// 接收一个或多个参数，最后返回合并的对象
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)
// 遍历参数
  objs.forEach(obj => {
    if (obj) {
      // 遍历对象的键
      Object.keys(obj).forEach(key => {
        // 对应对象的键的值
        const val = obj[key]
        // 如果此值是个对象
        if (isPlainObject(val)) {
          // 判断result对应的键值对是否是对象
          if (isPlainObject(result[key])) {
            // 是则重复执行合并对象操作（递归）
            result[key] = deepMerge(result[key], val)
          } else {
            // 否则直接赋值
            result[key] = deepMerge({}, val)
          }
        } else {
          // 否则直接设置合并对象的键值对
          result[key] = val
        }
      })
    }
  })

  return result
}
```

- helpers下的headers

``` typescript
// 拉平参数
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  // 传入的参数放最后一个参数，因为后面的配置会覆盖前面的配置
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  // 最后把最外层配置的键，(即:headers:{common:{...}}这个common去掉)
  // 因为现在外层间的参数已经提取到和common同一层了
  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}
```

- core下的dispatchRequests

``` typescript
function processConfig(config: AxiosRequestConfig): void {
  ...
  // 将传入的配置传入拉平
  config.headers = flattenHeaders(config.headers,config.method)
}
```

## 编写demo

参考文档

# 请求和响应配置化





