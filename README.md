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