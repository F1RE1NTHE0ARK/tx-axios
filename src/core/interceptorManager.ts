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