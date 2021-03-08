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