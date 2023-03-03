# ES5/ES6 的继承除写法外还有什么区别？

- class 声明并不像 function 声明，不存在提升；但类似 let 声明，存在 TDZ(temporal dead zone)。
- class 中的代码都会自动的使用严格模式
- class 的所有方法（静态和实例）都是不可枚举的(non-enumerable)
- class 内所有方法内部都缺少`[[Construct]]`，因而不能用 new 操作符来调用
- class 必须使用 new 操作符来初始化
- 不能在 class 的方法中对 class（变量）做重新赋值

考虑上述几点，下面来实现 ES5 对 ES6 class 的等价模拟：

```js
class PersonClass {
	constructor(name) {
		this.name = name;
	}
	sayName() {
		console.log(this.name);
	}
}

/* 等价于 */

let PersonConstructor = (function (
  "use strict";
  // 用 const，确保不可在内部对其重新赋值
  const PersonConstructor = function(name) {
    // 确保该函数必须通过 new 来调用
    if (typeof new.target === 'undefined') {
      throw new Error('Constructor must be called with new.')
    }
    this.name= name
  }

  Object.defineProperty(PersonConstructor.prototype, "sayName", {
    value: function() {
      // 确保该方法不能通过 new 来调用
      if (typeof new.target !== "undefined") {
        throw new Error("Method cannot be called with new.")
      }
      console.log(this.name)
    },
    enumerable: false, // 不可枚举
    writable: true,
    configurable: true
  })

  return PersonConstructor
) {})();
```

## class 表达式

class 也可使用表达式（这点与 function 类似），当然与 class 声明只是风格上的不同

```js
// 匿名表达式
let PersonClass = class {
	constructor(name) {
		this.name = name;
	}
	sayName() {
		console.log(this.name);
	}
};

// 具名表达式
PersonClass = class PersonClassRaw {
	constructor(name) {
		this.name = name;
	}
	sayName() {
		console.log(this.name);
	}
};

console.log(typeof PersonClass); // "function"
console.log(typeof PersonClassRaw); // undefined 这点要留意
```

## class 是一等公民

javascript 中 class 同样是一等公民，有多种方式去使用

1. 作为参数：

```js
function createObject(classDef) {
	return new classDef();
}
let obj = createObject(
	class {
		sayHi() {
			console.log("Hi!");
		}
	}
);
obj.sayHi(); // "Hi!"
```

2. 可使用立即执行来创建单例

```js
let person = new (class {
	constructor(name) {
		this.name = name;
	}
	sayName() {
		console.log(this.name);
	}
})("xhs");
person.sayName(); // "xhs"
```

## 访问的属性

class 允许在原型上通过 set 和 get 来定义访问器属性

```js
class CustomHTMLElement {
	constructor(element) {
		this.element = element;
	}
	get html() {
		return this.element.innerHTML;
	}
	set html(value) {
		this.element.innerHTML = value;
	}
}
var descriptor = Object.getOwnPropertyDescriptor(
	CustomHTMLElement.prototype,
	"html"
);
console.log("get" in descriptor); // true
console.log("set" in descriptor); // true
console.log(descriptor.enumerable); // false
```

类似以下这种无 class 的情况（最终都是在 Object.defineProperty 中处理）:

```js
// direct equivalent to previous example
let CustomHTMLElement = (function () {
	"use strict";
	const CustomHTMLElement = function (element) {
		if (typeof new.target === "undefined") {
			throw new Error("Constructor must be called with new.");
		}
		this.element = element;
	};
	Object.defineProperty(CustomHTMLElement.prototype, "html", {
		enumerable: false,
		configurable: true,
		get: function () {
			return this.element.innerHTML;
		},
		set: function (value) {
			this.element.innerHTML = value;
		},
	});

	return CustomHTMLElement;
})();
```

## Generator 方法

class 内部支持 generator 方法

```js
class Collection {
	constructor() {
		this.items = [];
	}

	*[Symbol.iterator]() {
		yield this.items.values();
	}
}

var collection = new Collection();
collection.items.push(1);
collection.items.push(2);
collection.items.push(3);

for (let x of collection) {
	console.log(x);
}
```

## 静态方法

暂不赘述了，总是 class 内只需在方法名前添加关键字 static

## 派生继承

ES6 前，有多种方式实现继承，适当的继承有以下步骤:

```js
function Rectangle(length, width) {
	this.length = length;
	this.width = width;
}
Rectangle.prototype.getArea = function () {
	return this.length * this.width;
};

function Square(length) {
	Rectangle.call(this, length, length);
}
/* 
以现有对象（第一个参数）为原型，创建新对象；第二个参数对应于 Object.defineProperties() 的第二个参数，即新对象自有属性（非原型链上）的属性名-属性描述符映射
*/
Square.prototype = Object.create(Rectangle.prototype, {
	constructor: {
		value: Square,
		enumerable: true,
		writable: true,
		configurable: true,
	},
});
var square = new Square(3);
console.log(square.getArea()); // 9
console.log(square instanceof Square); // true
console.log(square instanceof Rectangle); // true
```

要让 Square 继承自 Rectangle，还得使 `Square.prototype` 继承自 `Rectangle.prototype`；而 ES6 显然更简单直观

```js
class Rectangle {
	constructor(length, width) {
		this.length = length;
		this.width = width;
	}
	getArea() {
		return this.length * this.width;
	}
}

class Square extends Rectangle {
	constructor(length) {
		// same as Rectangle.call(this, length, length)
		super(length, length);
	}
}

var square = new Square(3);
console.log(square.getArea()); // 9
console.log(square instanceof Square); // true
console.log(square instanceof Rectangle); // true
```

通过 extends 来继承，子类构造函数须通过 super 调用父类构造函数（否则会出错）并传递参数；constructor 可不出现（如无必要），会默认添加。此方式继承的类称为派生类

使用 `super()` 的时，需记住以下几点：

- 只可在派生类(extends)中使用 `super()`，否则会出错
- constructor 中的 `super()` 必须在用到 this 前调用，否则会出错
- 派生类中避免使用 `super()` 的唯一方法是使 constructor 返回一个对象(非原始类型)（？？？）

## 继承静态成员

暂不赘述

## 可用于派生的类型

只要一个函数内部存在 `[[Constructor]]` 且有 prototype，则其就可被 extends。见下例：

```js
let SerializableMixin = {
	serialize() {
		return JSON.stringify(this);
	},
};

let AreaMixin = {
	getArea() {
		return this.length * this.width;
	},
};

function mixin(...mixins) {
	var base = function () {};
	Object.assign(base.prototype, ...mixins);
	return base;
}

class Square extends mixin(AreaMixin, SerializableMixin) {
	constructor(length) {
		super();
		this.length = length;
		this.width = length;
	}
}

var x = new Square(3);
console.log(x.getArea()); // 9
console.log(x.serialize());
```

该例可工作，因为 mixin 方法返回 Function 类型，且满足 `[[Constructor]]` 和 prototype 的要求。另外虽然基类是空的，但是仍使用了 `super()`（否则报错）。若 mixin 中有多个相同的 prototype，则以最后一个为准

## 继承内部属性

以数组为例，在 ES5 或更早前版本，开发者若想通过继承来定制数组类型是几乎不可能的，使用经典继承无法使相关代码正常运行。例如：

```js
// 内置数组行为
let colors = [];
colors[0] = "red";
console.log(colors.length); // 1

colors.length = 0;
console.log(colors[0]); // undefined

// ES5 中尝试继承数组
function MyArray() {
	Array.apply(this, arguments);
}
MyArray.prototype = Object.create(Array.prototype, {
	constructor: {
		value: MyArray,
		writable: true,
		configurable: true,
		enumerable: true,
	},
});

colors = new MyArray();
colors[0] = "red";
console.log(colors.length); // 0

colors.length = 0;
console.log(colors[0]); // "red
```

可发现以上并未继承内部属性。而 ES6 的一个目标就是可继承内部的属性方法，因此 ES6 class 继承与 ES5 经典继承略有不同：

- 经典继承先创建派生类的 this，然后才调用基类构造函数，这意味着后者的其他属性仅作修饰
- 而 ES6 class 恰恰相反，this 首先由基类来创建，再通过派生类构造函数来改变。这样使得基类内置功能被全盘接收。如下：

```js
class MyArray extends Array {}

var colors = new MyArray();
colors[0] = "red";
console.log(colors.length); // 1

colors.length = 0;
console.log(colors[0]); // undefined
```

## Symbol.species 属性

extends 使基类的所有内置功能得以继承，且内置方法返回的实例也同样是派生类的实例。例如上例的 MyArray，其 slice 方法返回的也是该派生类自身的实例

```js
class MyArray extends Array {}

let items = new MyArray(1, 2, 3, 4);
let subitems = items.slice(1, 3);

console.log(items instanceof MyArray); // true
console.log(subitems instanceof MyArray); // true
```

MyArray 实例的 slice 方法继承自 Array ，正常情况下应返回 Array 实例。但实际上 `Symbol.species` 在幕后进行改变

`Symbol.species` 是一个静态访问器属性，用于定义返回函数，每当在实例方法内创建实例时就会用到后者(而非直接用构造函数)

以下内置类型定义了 Symbol.species：Array、ArrayBuffer、Map、Promise、Set、RegExp、Typed Arrays，默认返回 this，即始终返回构造函数

例如：

```js
class MyClass {
	static get [Symbol.species]() {
		return this;
	}
	constructor(value) {
		this.value = value;
	}
	clone() {
		return new this.constructor[Symbol.species](this.value);
	}
}
```

<!-- 上面代码只有静态 getter，因为要修改内置的类型，这是不可能的。 所有调用 this.constructor[Symbol.species]的都会返回派生类 MyClass. 如 clone 调用了，并且返回了一个新的实例。 再看下面的例子: -->
