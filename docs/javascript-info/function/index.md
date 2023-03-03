# 函数概述

函数是一个引用类型的值，除可自定义属性外，还拥有以下两个特殊属性：

- `name`，即函数名，会根据上下文来推断，少数情况下为空字符串

- `length`，即函数定义的形参个数，Rest 参数不计

---

函数可通过以下方式创建：

- **函数声明**，相关函数会在代码块（脚本）执行的前一刻创建，因而在块内任意位置可用，但块外**不可见**（严格模式）

- **函数表达式**，在执行到相关语句时创建

  - 当表达式中指定函数名时，也被称为**命名函数表达式**（NFE），会在函数局部域内创建同名变量引用该函数（以防其赋值给其他变量后失去引用）

- `new Function([arg1, arg2, ...argN], functionBody)`，即根据字符串动态创建函数，后者的`[[Environment]]`指向全局环境而非当前词法环境，因而只能访问全局变量而非外部（outer）变量

---

函数可分为普通函数和**箭头函数**，后者具有以下不同点：

- 无`this`，若访问则会从外部获取

- 不能作为构造器，不能用`new`调用

- 无`arguments`

- 无`super`

---

函数在调用时可传入任意数量实参，而形参个数往往有限，因而可通过以下方式收集实参：

- 将**末位**形参定义为`...argName`形式，即**Rest 参数**，对应一个包含所有剩余实参的**数组**

- 在**非箭头函数**域内访问**可迭代类数组**对象`arguments`，后者包含所有实参

此外调用函数时可以形如`...iterable`的方式传参，即**Spread 语法**，将**可迭代对象**展开为实参列表。其可与常规实参混同使用

---

- 函数可作为其他函数的入参，其也被称为**回调函数**或**回调**

- `Function.prototype.call(context, arg1, arg2, ...)`方法以参数列表`arg1, arg2, ...`为入参调用函数并设置其`this`指向

- `Function.prototype.apply(context, arguments)`类同`call`方法，但期望接收**类数组**而非参数列表。该方式可实现**调用转移**（call forwarding），即一个函数将所有实参连同上下文传递给另一个函数

- 将其他对象的方法（通常在其原型链上）更改`this`指向后调用，这一技巧也被称为**方法借用**（method borrowing）

- 函数可接收另一个函数为入参，并返回改变其行为的新函数。前者被称为**装饰器**（decorator），后者被称为**包装器**（wrapper）

- 装饰器模式有一瑕疵，即返回的包装器通常将不再拥有原始函数的属性（如有）。该需求可借助`Proxy`来解决

<!-- 通常，闭包是指使用一个特殊的属性 [[Environment]] 来记录函数自身的创建时的环境的函数。它具体指向了函数创建时的词法环境 -->

## 深入内在

- **执行上下文**（the execution context），在函数调用时生成的包含执行过程信息（如当前控制流所在位置、this 指向...）的内部数据结构。当进行嵌套函数调用时将发生：

  1. 暂停当前函数，将其关联执行上下文存于**执行上下文堆栈**中
  2. 执行嵌套调用
  3. 结束后从停止位置恢复外部函数，从堆栈中恢复其执行上下文

- **递归**（closure），即函数调用自身。其最大嵌套调用次数（含首次）被称为**递归深度**，受限于引擎一般须不大于 10000。任何递归都可重写为循环（通常更有效）

- **词法环境**（Lexical Environment），每个**运行的函数**（及代码块、脚本）都具有的隐藏对象，由两部分组成：

  - **环境记录**（Environment Record），以所有局部变量为其属性的对象

  - **对外部词法环境的引用**

  函数的`[[Environment]]`引用了其被创建时所在的词法环境，后者与函数在何处调用无关

- **闭包**，指一个函数可通过`[[Environment]]`引用其所在词法环境，以访问外部变量。除`new Function`外所有函数均天生闭包

## 生成器（generator）

语法形如`function* f(…) { ... }`或`function *f(…) { ... }`（推荐前者），其内部可使用`yield`关键字**产出**值。有别于返回（`return`），`yield`可存在多次

生成器在调用后将返回相应**迭代器**（iterator），其中代码会在后者`next`方法被调用时开始执行，直至最近的`yield <value>`语句，产出值将作为后者的**迭代值**。要点如下：

- 生成器有助于更简洁地实现可迭代对象，参见下方[实例](./#实例)

- 生成器允许无限`yield`（如在`while`循环中），但若用于迭代则须考虑如何中止（`break`/`return`）

- 生成器内允许存在`return`语句，返回值将作为相应迭代器的最终迭代值<!--  被执行到时`next`方法将返回`{value, done: true}`且之后的调用均返回`{done:true}`（迭代终止） -->

- 生成器内可用`yield* iterator`转发另一迭代器的**迭代值**，视同在当前生成器中产出。[实例](./#实例)

- 通过对应**迭代器**的如下方法，外部值可被传回生成器内：

  - `iterator.next(value)`，即将`value`作为当前`yield`语句的返回值（注意与产出值区别）

  - `iterator.throw(value)`，向生成器内传递一个值，后者将在当前`yield`所在行抛出

  - `iterator.return(value)`，终止生成器的执行并返回`{ value, done: true }`

- 生成器也可以`async`关键字标识为异步，并在其内部使用`await`。相应地，其返回生成器的`next`方法也是异步的（返回 Promise 对象）。注意异步可迭代对应的是`Symbol.asyncIterator`方法，[参见](/javascript-info/object-advanced/#可迭代对象)

## 实例

```js
// 计算斐波那契数，n较大时效率极低
function fib_recursion(n) {
	return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}
// 用循环重写
function fib_loop(n) {
	let prev = 1;
	let cur = 1;
	for (let i = 3; i <= n; i++) {
		let next = prev + cur;
		prev = cur;
		cur = next;
	}
	return cur;
}

// 输出单链表
const list = {
	value: 1,
	next: {
		value: 2,
		next: {
			value: 3,
			next: {
				value: 4,
				next: null,
			},
		},
	},
};
function print_recursion(list) {
	console.log(list.value);
	if (list.next) {
		print_recursion(list.next);
	}
}
function print_loop(list) {
	let cur = list;
	while (cur) {
		console.log(cur.value);
		cur = cur.next;
	}
}

// 反向输出
function print_reverse_recursion(list) {
	if (list.next) {
		print_reverse_recursion(list.next);
	}
	console.log(list.value);
}
function print_reverse_loop(list) {
	const arr = [];
	let cur = list;

	while (cur) {
		arr.push(cur.value);
		cur = cur.next;
	}

	for (let i = arr.length - 1; i >= 0; i--) {
		console.log(arr[i]);
	}
}

// 借助生成器实现可迭代对象
const range = {
	from: 1,
	to: 5,
	*[Symbol.iterator]() {
		for (let value = this.from; value <= this.to; value++) {
			yield value;
		}
	},
};

// 生成器嵌入（组合）的例子
{
	function* generateSequence(start, end) {
		for (let i = start; i <= end; i++) yield i;
	}

	function* generateAlphaNum() {
		// 0-9
		yield* generateSequence(48, 57);
		// A-Z
		yield* generateSequence(65, 90);
		// a-z
		yield* generateSequence(97, 122);
	}

	let str = "";
	for (let code of generateAlphaNum()) {
		str += String.fromCharCode(code);
	}
	console.log(str);
}
```
