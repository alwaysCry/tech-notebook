# 面试题解析之框架

// TODO：defineProperty 响应式实现可参见：https://juejin.cn/post/6844903601416978439
// TODO：defineProperty 也可监听数组，尝试实现

## defineProperty 与 Proxy 实现响应式对比

- `Object.defineProperty` 直接监听数组成本过高（需要遍历），Vue2 hack 了 7 个数组方法来实现监听（push、pop、shift、unshift、splice、sort、reverse）

- `Object.defineProperty` 监听的是属性（需要遍历对象），也无法监听到后者的增减（Vue2 中须手动触发）

- Proxy 可直接监听（代理）对象和数组（无需遍历，但对深层对象**属性**仍需递归处理）

## Vue 父子组件生命周期钩子执行顺序

- 加载渲染过程：父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted
- 子组件更新过程：父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
- 父组件更新过程：父 beforeUpdate -> 父 updated
- 销毁过程：父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

## redux 为何把 reducer 设计成纯函数

redux 并未强制（也无法）让 reducer 为纯函数，但最好是

reducer 的设计思路：接收旧 state 和 action，返回新 state。其职责上不允许有副作用，唯一输入对应唯一输出，否则返回的 state 就不确定

<!-- redux的设计思想就是不产生副作用，数据更改的状态可回溯，所以redux中处处都是纯函数 -->

<!-- 例如：你的 reducer 就做了一个 value = value + 1 这个逻辑，然后返回 state 为{value}，ok，这个过程太 jr 纯了，然后你可能觉得要加个请求来取得 value 后再加 1，那么你的逻辑就是 value = getValue() + 1, getValue 是个请求函数，返回一个值，这种情况，退一万步讲，如果你的网络请求这次出错，那么 getValue 就返回的不是一个数值，value 就不确定了，所以 return 的 state 你也不确定了，前端 UI 拿到的数据也不确定了，所以就是这个环节引入了副作用，他娘的 redux 设计好的规范就被你破坏了，redux 就没卵用了。到此为止这个问题回答完了，我没有说什么上面几个 jr 说的教科书的理论，甚至还加了些脏话。请原谅，这只是戏剧需要。

最后我回答下如何解决这个副作用，实际上也很白痴的问题，这里的请求可以放在 reducer 之前，你先请求，该做出错处理的就做出错处理，等拿到实际数据后在发送 action 来调用 reducer。这样通过前移副作用的方式，使 reducer 变得纯洁。 -->

附：redux 三大原则

- 单一数据流：整个应用的 state 都被储存在单一 store 里，构成一个 Object tree

- State 是只读： 唯一改变方式为触发 action, 后者是一个描述已发生事件的普通对象

- 使用纯函数执行修改：为描述 action 如何改变 state tree，需要编写 reducers

## react-router 中 `<Link>` 与 `<a>` 标签的区别（？？？）

`<Link>` 渲染到 DOM 也是 `<a>` 标签，区别在于：前者阻止了默认行为，并调用 history API（or hash）。Router 通过监听页面 hasChange 事件处理相应跳转逻辑

## Vue2 如何变异数组方法

相关源码：

```js
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);
const methodsToPatch = [
	"push",
	"pop",
	"shift",
	"unshift",
	"splice",
	"sort",
	"reverse",
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
	const origin = arrayProto[method];
	def(arrayMethods.method, function mutator() {
		const args = [];
		let len = arguments.length;
		while (len--) args[len] = arguments[len];

		const result = original.apply(this, args);
		const ob = this.__ob__;
		let inserted;
		switch (method) {
			case "push":
			case "unshift":
				// [].push(1) / [].unshift(1) ->  arg = [1]
				inserted = args;
				break;
			case "splice":
				// [1,2,3].splice(0,1,1) , 第3个及之后的参数为插入值
				inserted = args.slice(2);
				break;
		}
		if (inserted) {
			ob.observeArray(inserted);
		}
		/* 
      监听变化：
      - 若非插入操作则直接循环响应
      - 若为移除数组元素方法，触发一次 notify 将会重新计算
      - 若仅添加数字类型元素，任何操作只需再执行一次 notify 即可
      - 若添加了对象类型元素，则需重新监听
      通过下标，以及对 length 属性的改动无法监听是因为无法触发 obj 的 get 方法
    */
		ob.dep.notify();
		return result;
	});
});
```

核心即：hack 了数组方法，使其在执行时向外抛出变化，提醒观察者更新。且若通过 push、unshift、splice 方法添加了对象类型元素，后者还将被响应式化
