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

