# 使用jest测试

## 语法

## describe

```js
describe("关于每个功能或某个组件的单元测试",()=>{
    // 不同用例的单元测试
})

例:
  describe('测试extend方法', () => {
    test('test测试标题', () => {
      const a = Object.create(null)
      const b = { foo: 123 }
      extend(a, b)
      expect(a.foo).toBe(123)
    })
  })
```

## expect

[expect说明](http://www.51testing.com/html/04/n-3726904-2.html)

```js
expect(运行结果).toBe(期望的结果);
//常见断言方法
expect({a:1}).toBe({a:1})//判断两个对象是否相等
expect(1).not.toBe(2)//判断不等
expect({ a: 1, foo: { b: 2 } }).toEqual({ a: 1, foo: { b: 2 } })//判断对象相等
expect(n).toBeNull(); //判断是否为null
expect(n).toBeUndefined(); //判断是否为undefined
expect(n).toBeDefined(); //判断结果与toBeUndefined相反
expect(n).toBeTruthy(); //判断结果为true
expect(n).toBeFalsy(); //判断结果为false
expect(value).toBeGreaterThan(3); //大于3
expect(value).toBeGreaterThanOrEqual(3.5); //大于等于3.5
expect(value).toBeLessThan(5); //小于5
expect(value).toBeLessThanOrEqual(4.5); //小于等于4.5
expect(value).toBeCloseTo(0.3); // 浮点数判断相等
expect('Christoph').toMatch(/stop/); //正则表达式判断
expect(['one','two']).toContain('one'); //判断是否包含
expect.anything()//它匹配除null或undefined之外的任何内容
expect.any(constructor) //匹配给定构造函数所创建的任何内容,即是否为此构造器创建的
expect.arrayContaining(array)//匹配一个接收到的数组，该数组包含预期数组中的所有元素，例:expect.arrayContaining([1, 2, 3, 4, 5, 6])
```

## it和text

```js
//这两个其实差不多
test("测试用列描述信息",()=>{

})
// or
it("测试用例描述信息",()=>{

})
```

## text的done参数

``` typescript
// 无效测试示例
test('the data is peanut butter', () => {
	function callback(data) {
		// 以下不会执行
		expect(data).toBe('peanut butter');
	}
	// 异步获取数据
	fetchData(callback);
	// 测试会立即结束。
});
// 有效测试示例
test('the data is peanut butter', done => {
	function callback(data) {
		expect(data).toBe('peanut butter');
		// done被调用时，测试结束
		done();
	}
	fetchData(callback);
});

```



## jest.fn

在单元测试中 ,我们一般对代码进行最小单元的测试 , 并不会关心模块/业务之间的耦合 , 所以我们会使用 mock 工具进行数据/方法的模拟实现 , 节约不必要的测试用例代码

jest 种的常用 mock 函数

jest 内置了 mock 功能足够应付大部分的测试场景

fn() 最简单的 mock 函数 , 如果不定义参数的话默认返回 undefind

```tsx
test("sum 1+1 =2", () => {
  expect(sum(1, 1)).toBe(2);
});

test("使用fn() mock一个 undefined 数据", () => {
  let mockResult = jest.fn();
  expect(mockResult()).toBeUndefined();
});

test("使用fn() mock 数据 观察是否被调用", () => {
  let mockResult = jest.fn();
  let useReuslt = mockResult();
  expect(mockResult).toBeCalled();
});

test("使用fn() mock 数据 观察是否被调用一次", () => {
  let mockResult = jest.fn();
  let useReuslt = mockResult();
  expect(mockResult).toBeCalledTimes(1);
});

test("使用fn() mock一个带参函数", () => {
  let mockResult = jest.fn();
  let paramsResult = mockResult(1, 2, 3);
  expect(mockResult).toHaveBeenCalledWith(1, 2, 3);
});

test("使用fn() 设置返回值", () => {
  let mockResult = jest.fn().mockReturnValue("linqisheng");
  let result = mockResult();
  expect(result).toBe("linqisheng");
});

test("使用fn() 自定义函数", () => {
  let mockResult = jest.fn((str) => str);
  expect(mockResult("linqisheng")).toBe("linqisheng");
});

test("使用fn() 自定义异步函数 promise", () => {
  let mockResult = jest.fn().mockResolvedValue("linqisheng");
  // 断言mockFn调用后返回的是Promise对象
  expect(Object.prototype.toString.call(mockResult())).toBe("[object Promise]");
});
```

## jest全局函数

- beforeEach 每个测试前都调用
- afterEach 每个测试后都调用
- beforeAll 测试文件开始后调用
- afterAll 测试文件最后调用

## 全局函数作用域

默认情况下，before和after的块可以应用到文件中的每一个测试。此外可以通过describe块来将将测试中的某一块进行分组。当before和after的块在describe块内部的时候，则只适用于该describe块内的测试。

- 顶级的beforeEach描述块内的beforeEach之前执行，以下的例子可以方便我们认识到执行的顺序

```tsx
beforeAll(() => console.log('1 - beforeAll'));
afterAll(() => console.log('1 - afterAll'));
beforeEach(() => console.log('1 - beforeEach'));
afterEach(() => console.log('1 - afterEach'));
test('', () => console.log('1 - test'));
describe('Scoped / Nested block', () => {
  beforeAll(() => console.log('2 - beforeAll'));
  afterAll(() => console.log('2 - afterAll'));
  beforeEach(() => console.log('2 - beforeEach'));
  afterEach(() => console.log('2 - afterEach'));
  test('', () => console.log('2 - test'));
});

//总结为全局beforeAll，afterAll只执行一次
//一个describe块内beforeAll，afterAll只执行一次
//全局beforeEach先于describe块内beforeEach执行
//全局afterEach后于describe块内afterEach执行

// 1 - beforeAll 
// 1 - beforeEach
// 1 - test
// 1 - afterEach
// 2 - beforeAll
// 1 - beforeEach  //特别注意
// 2 - beforeEach
// 2 - test
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll
```