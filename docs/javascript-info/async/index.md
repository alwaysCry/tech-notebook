# 宏/微任务、事件循环及异步

- **宏任务**（macrotask）来自于脚本的执行、UI 或网络事件的处理、到期定时器回调。若此时引擎处于繁忙状态，则会被排入**宏任务队列**

- **微任务**（microtask）仅来自于代码。以下“任务”会被排入**微任务队列**中，待当前（宏）任务执行完毕后被引擎逐一执行并出队，这样即确保微任务（执行）间应用环境基本相同（无光标位置更改、无新网络数据...）

  - 已就绪 Promise 对象的`then`/`catch`/`finally`处理程序

  - `queueMicrotask`函数的回调

- **事件循环**，即引擎在等待（宏）任务、执行、休眠的状态间转换的无限循环。细节梳理：

  - 步骤 1：从宏任务队列中出队执行最早的任务

  - 步骤 2：执行并清空微任务队列

  - 步骤 3：渲染

  - 步骤 4：若宏任务队列非空，则转步骤 1；否则休眠直到出现宏任务

浏览器只在宏任务完成后才做渲染，宏/微任务执行时间过长将导致挂起，一种优化方式是用`setTimeout`的零延时调用，将单一任务拆分至不同的宏任务中执行。[实例](./#实例)

---

- `setTimeout(func, [delay], [arg1], [arg2], ...)`函数返回定时器标识符（timer identifier），可作为`clearTimeout`函数的入参以取消调度。细节：

  - 浏览器中，嵌套超 5 层的`setTimeout`会有 4ms 以上的最小延迟（`setInterval`同理）

- `setInterval`函数语法相同，将返回值传入`clearInterval`可阻止后续。细节：

  - 考虑到回调执行时长，**实际调用间隔会短于代码设定间隔**。改用嵌套`setTimeout`会相对精确，[实例](./#实例)

## Promise 对象

串联生产者与消费者代码的特殊对象，构造语法：`new Promise(function(resolve, reject) { ... })`

- 构造器入参即 executor，含生产者代码，在 Promise 对象创建时**同步**执行并接收 JS 提供的回调：

  - `resolve`，任务成功时调用，可传入结果值

  - `reject`，任务失败时调用，通常传入 Error 对象（也可为任意值，但不推荐）

- 上述回调仅可调用一次（后续会被忽略），且将永久性改变 Promise 对象的**内部属性**：

  - state：初为 **pending**，`resolve`/`reject`被调用时相应变为 **fulfilled** 或 **rejected**，二者又可统称为 **settled**

  - result：初为`undefined`，当 settled 时变为`resolve`或`reject`的对应入参

- Promise 对象有以下方法注册处理程序，后者也称 handler：

  - `then`，可注册 2 个消费者 handler 分别在 fulfilled/rejected 时以 result 为入参被执行，返回新 Promise 对象：

    - 若无 handler 被执行，则新 Promise 对象将包含**原 result**

    - 若有 handler 被执行，且返回另一 Promise 对象，则新 Promise 对象将可**视同**后者

    - 否则，新 Promise 对象的 result 即为被执行 handler 的返回或抛出值

  - `catch`，等价于 `then(null, handler)`

  - `finally`，注册清理者 handler，在 settled 时**无入参**执行，返回新 Promise 对象：

    - 若 handler 中有抛出值，则返回值以后者为 result， rejected

    - 否则返回值将保持**原 state 和 result**

- 此外若 handler 返回 thenable 对象，即实现`then`方法的对象时，将被视同返回 Promise 对象。该方法将接收`resolve`和`reject`为入参，其行为等同于 executor

- 可为已 settled 的 Promise 对象注册 handler，后者将“立即”（非同步）执行

- Promise 对象的 executor 和 handler 中代码被隐式`try...catch`包裹，发生异常（无论是否手动抛出）将导致所在/所返回的 Promise 对象 rejected。以下代码等同：

  ```js
  new Promise((resolve, reject) => {
  	throw new Error("Whoops!");
  });
  // ---
  new Promise((resolve, reject) => {
  	reject(new Error("Whoops!"));
  });
  ```

  注意，**executor 中抛错必须以同步形式**，否则只能借助`reject`回调。[实例](./#实例)

- 可基于上述特性构建 Promise 链，概要而言：

  - 当链条中前一 Promise 对象 pending 时，后续 handler 将等待直至其 settled

  - 若 handler 中未抛错，则控制权（连同 result，下同）将被移至下一最近的 resolved handler

  - 当链条中某个 Promise 对象 rejected 或其 executor/handler 发生异常，控制权将移至最近的 rejection handler

  - 单个 rejection handler 通常仅处理一类错误，并将其他错误再次抛出，即 **rethrowing**

  - 微任务队列清空时，未经处理的 rejected Promise 对象将导致一个全局错误，可监听`unhandledrejection`事件获取相关信息：

    ```js
    window.addEventListener("unhandledrejection", (event) => {
    	console.log(event.promise); // 未被处理的 rejected Promise
    	console.log(event.reason); // 该 Promise 对象的 result
    });
    ```

- Promise 类具有以下静态方法：

  - `Promise.resolve/reject`：使用给定 result 创建一个 fulfilled/rejected 的 Promise 对象

  - `Promise.all`：接受**可迭代对象**为入参，返回新 Promise 对象（以下皆同）：

    - 当入参中所有 Promise 成员均 fulfilled 时，返回值 fulfilled，并以入参 result 所构成数组为其 result（各项维持原有顺序，非 Promise 值将原样传递）

    - 而当任一 Promise 成员 rejected，则返回值 rejected 且仅包含前者 result

  - `Promise.allSettled`（ES2020 新增）：类似`Promise.all`，但返回值会在所有 Promise 成员 settled 后 fulfilled，并返回形如`{status: "fulfilled"/"rejected", value: result/error}`项组成的数组。[Polyfill 参见](./#实例)

  - `Promise.race(promises)`：返回值会在任一 Promise 成员 settled 后 settled ，并取其 result

  - `Promise.any(promises)`（ES2021 新增）：

    - 返回值会在任一 Promise 成员 fulfilled 后 fulfilled ，并取其 result；

    - 否则若所有 Promise 成员均 rejected，返回值将以`AggregateError`为 result rejected

## Promise 化

即 Promisification，指将一个接受回调的函数改造为返回 Promise 对象，[参见实例](./#实例)。或可使用诸如 [es6-promisify](https://github.com/digitaldesignlabs/es6-promisify) 之类的三方库，Node 中则有内建的`util.promisify`

当然 Promise 化仅适用只执行一次回调的函数，理论上一个回调可被调用多次

## async 关键字

关键字`async`可令函数：

- 总返回 Promise 对象：

  - 若函数中有抛错且未被捕获，则返回值以抛出值为 result， rejected

  - 否则，将以其`return`值为 result，fulfilled

- 允许在函数体中将`await`关键字置于 Promise/thenable 对象前，当执行至前者时函数将被暂停直至后者 settled

  - 若后者 fulfilled，则将以其 result 为结果继续执行

  - 若后者 rejected，则将在该行抛出其 result，可用`try...catch`捕获

**现代浏览器**允许在 module 中包含顶层`await`

## 实例

```js
// 拆分CPU过载任务
{
	const start = Date.now();
	let i = 0;
	function count() {
		// 嵌套setTimeout存在强制最小延迟，因而前置schedule效率更高
		if (i < 1e9 - 1e6) {
			setTimeout(count);
		}
		do {
			i++;
		} while (i % 1e6 != 0);
		if (i === 1e9) {
			console.log(`Done in ${Date.now() - start}ms`);
		}
	}

	count();
}

// 嵌套setTimeout实现定时执行
function printNumbers(from, to) {
	let current = from;

	setTimeout(function go() {
		console.log(current);
		if (current < to) {
			setTimeout(go, 1000);
		}
		current++;
	}, 1000);
}
printNumbers(5, 10);

// 不触发 rejection handler
new Promise(function (resolve, reject) {
	setTimeout(() => {
		throw new Error("Whoops!");
	}, 1000);
}).catch(console.log);

// Promise.allSettled Polyfill
{
	const rejectHandler = (reason) => ({ status: "rejected", reason });
	const resolveHandler = (value) => ({ status: "fulfilled", value });
	Promise.allSettled = function (promises) {
		const convertedPromises = promises.map((p) =>
			Promise.resolve(p).then(resolveHandler, rejectHandler)
		);
		return Promise.all(convertedPromises);
	};
}

// Promisification
function promisify(f) {
	return function (...args) {
      // 为 f 定义回调
			function callback(err, result) {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			}
      // 将回调附加至参数列表末尾
			args.push(callback);
      // 调用原始函数
			f.call(this, ...args);
		});
	};
}

// 高阶 Promisification，兼容被改造函数使用多参回调的情况
function promisifyAdvance(f, manyArgs = false) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      // callback 可能拥有更多参数
      function callback(err, ...results) {
        if (err) {
          reject(err)
        } else {
          resolve(manyArgs? results : results[0])
        }
      }
      args.push(callback)
      f.call(this,...args)
    })
  }
}

```
