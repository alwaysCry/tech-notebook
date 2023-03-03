# 错误处理概述

JavaScript 中的错误分为：

- **解析时错误（parse-time errors）**：代码包含语法错误而使引擎无法解析，无法（从代码内部）恢复
- **运行时错误（runtime errors）**：有效代码中出现的错误，也称为异常（exceptions）

错误处理仅对运行时错误有效

<!-- TODO：需要多了解发生错误时调用栈的相应行为 -->

## 捕获错误

语法结构 `try {...} catch(err) {...} finally {...}` 可捕获并处理错误，其按以下步骤执行：

1. 首先执行 try 块中的对应代码
2. 若无错误则执行到末尾并跳过 catch 子句
3. 若出现错误，则停止执行后续代码，转而执行 catch 子句。变量 err（可为任意名称）为 Error 对象，包含了错误的详细信息
4. 执行 finally 子句中代码（无论是否出现错误）

catch 子句和 finally 子句可只存其一，所以 try...catch 或 try...finally 都可行

要点：

- **try 块中的代码必须同步执行**，异步执行代码中的异常无法被 try...catch 捕获。例如：

```js
try {
	setTimeout(() => {
		noSuchVar; // 代码将在此停止
	}, 1000);
} catch (err) {
	console.log(err); // 不会被执行
}
// 须改为...
setTimeout(function () {
	try {
		noSuchVar;
	} catch (err) {
		console.log(error); // 错误将被捕获，此处会被执行
	}
}, 1000);
```

- 若不需要 Error 对象，可使用 `catch {...}` 替代 `catch (err) {...}` 来忽略（旧浏览器可能需要 polyfills）

- **finally 子句会在 try...catch 的任意出口生效**，即使是通过 return 语句退出。后者会使该子句在控制权转移前执行。例如：

```js
function f1() {
	try {
		return 1;
	} catch (err) {
		/* ... */
	} finally {
		console.log("finally");
	}
}
console.log(f1()); // 先打印 “finally” 再打印 “1”
// 在 catch 子句中重新抛出错误也是同理
function f2() {
	try {
		throw new Error("Unknown Exception");
	} catch (err) {
		// 若无法处理
		throw err;
	} finally {
		console.log("cleanup!");
	}
}
f(); // cleanup!
```

## Error 对象

Error 对象在发生错误时产生。内建 Error 包含下列属性：

- **name**：Error 名称
- **message**：Error 的描述信息
- **stack**：Error 发送时的调用栈，非标准属性，但被广泛支持

## 抛出错误

可使用 throw 操作符抛出自定义错误，语法为 `throw <error object>`。技术上可抛出任意类型数据，但最好继承自内建 Error（详见下文）

JavaScript 提供了很多内建 Error：Error、SyntaxError、ReferenceError、TypeError 等，其 name 属性即为构造器名称，message 则来自于参数

<!-- 技术上可将任何东西用作 error 对象，甚至是一个原始类型数据，如数字或字符串。但最好使用对象，并具有 name 和 message 属性（某种程度上保持与内建 error 的兼容性）-->

catch 会捕获到所有来自 try 代码块的错误，但通常只有部分能被处理，而其他的将被重新抛出

<!-- 通常需包装 Error 以记录调用信息... -->

通常使用 instanceof 操作符判断错误类型，原生错误可直接从 `err.name` 中获取构造函数名称。另一种方式是根据 `err.constructor.name`

## 全局捕获

未被 try...catch 捕获的错误，可通过全局捕获（通常只为达到监控目的），如 Node 中的 `process.on("uncaughtException")`

浏览器则通过 window 对象上的 error 事件：

- `window.onerror = function (msg, url, line, col, error) {}`，参数分别对应：错误信息、所在脚本 URL、对应代码的行、列、Error 对象。**局限：无法捕获 Promise 中错误以及网络、资源加载错误**

- `window.addEventListener("error", () => { ... })`，局限基本相同，但**资源标签**加载错误可通过开启捕获来监听

:::tip 提示
Promise 中错误可由 window 对象 unhandledrejection 事件全局捕获
:::

## 扩展 Error

在开发时常需要自定义 Error 类来反映特定错误，如网络操作中的 HttpError、数据库操作中的 DbError、搜索操作中的 NotFoundError 等

自定义 Error 应支持基本 error 属性，如 message、name 最好还有 stack，同时也可能有属于自己的属性。如 HttpError 可能会有 statusCode 属性，其值可为 404、403、500 等

技术上自定义 Error 最好从内建 Error 中继承，这样就可用 `obj instanceof Error` 来做识别。随应用程序的增长，自定义 Error 自然会形成一个层次结构（hierarchy），如 HttpTimeoutError 可能继承自 HttpError 等

简单示例：

```js
class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
}
function test() {
	throw new ValidationError("Whoops!");
}
try {
	test();
} catch (err) {
	console.log(err.name); // ValidationError
	console.log(err instanceof ValidationError); // true
}
```

相比 `err.name`，使用 instanceof 判断要更合理，后者对于新的继承类也同样适用。当然前提是拥有相应的 Error 基类，在处理三方库的 Error 时就不适用

### 深入继承

继承 Error 时 `this.name` 是在其构造器中手动重新赋值的，即每次构造都需要`this.name = <class name>`。该情况可通过创建自己的基础错误（basic error）类来避免。例如：

```js
// 基础错误
class MyError extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
	}
}

class ValidationError extends MyError {}

class PropertyRequiredError extends ValidationError {
	constructor(property) {
		supepr("No property: " + property);
		this.property = property;
	}
}

console.log(new PropertyRequiredError("field").name); // PropertyRequiredError
```

### 包装错误

随代码的壮大可能出现不同类型的 Error，很多情况下并不必列出所有可能类型一一判断，只需获取其详细信息，有必要时再检查其具体类型

这里可使用包装错误的方法，即将低级别错误包装到更抽象的错误中。例如读取数据时：

1. 创建 ReadError 类表示一般的数据读取错误
2. 当捕获到内部 Error 如 ValidationError、SyntaxError 时，抛出一个 ReadError 做替代
3. 该 ReadError 通过其 cause 属性来引用原始 Error

## 实用总结

- 可通过 try...catch 来中断数组迭代方法的执行(当然实际并不推荐)。如：

  ```js
  const arr = [1, 2, 3, 4, 5];
  try {
  	arr.forEach((i) => {
  		if (i === 3) throw new Error("中止");
  	});
  } catch (error) {
  	// ...
  }
  ```

-
