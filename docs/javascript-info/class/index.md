# 类概述

类的本质是函数（即 constructor 方法），其方法（包括 getters、setters）都被写入其 prototype 中

```js
class User {
	constructor(name) {
		this.name = name;
	}
	sayHi() {
		console.log(this.name);
	}
}

typeof User; // function
User === User.prototype.constructor; // true
User.prototype.sayHi; // sayHi
Object.getOwnPropertyNames(User.prototype); // constructor, sayHi
```

除普通方法外，类中还可包含：

- getters/setters

- 计算属性名

- 类字段（新特性），存在于每个实例对象中而非 prototype

- 静态方法：无法在单个对象上调用（只可在类上），其 this 指向类（constructor 方法）自身，可被继承

- 静态属性（新特性），同上

```js
class User {
	// 类字段
	surname = "penn";
	name = "young";
	// 用箭头函数固化 this
	say = () => console.log(this.fullName);

	constructor(value) {
		this.fullName = value;
	}
	// getter
	get fullName() {
		return `${this.name} ${this.surname}`;
	}
	// setter
	set fullName(value) {
		[this.name, this.surname] = value.split(" ");
	}

	// 计算属性
	["say" + "Hi"]() {
		console.log(this.fullName);
	}
	// 计算属性
	[Symbol.iterator]() {}

	// 静态方法
	// 等价于 User.staticMethod = function() {}
	static staticMethod() {}
	// 静态属性
	static type = "human";
}
```

类不单纯是语法糖，而有以下不同：

1. 类（constructor 方法）具有内部属性 `[[IsClassConstructor]]: true`，须使用 new 调用

2. 类方法不可枚举

3. 类结构中所有代码均为严格模式

类与函数一样，可在表达式中被定义、传递、返回、赋值。例如：

```js
let User = class MyClass {
	sayHi() {
		console.log(MyClass); //  MyClass 这个名称只在类内部可见
	}
};
new User().sayHi(); // 正常执行
console.log(MyClass); // Error，MyClass 在外部不可见

// 类可以被动态创建
function makeClass() {
	return class {
		sayHi() {
			console.log("Hi");
		}
	};
}
User = makeClass("Hello");
new User().sayHi();
```

## 类继承

扩展一个类 `class Child extends Parent` 意味着创建了两个 `[[Prototype]]` 引用：

- `Child.prototype.__proto__` 指向了 `Parent.prototype`：继承方法（可理解为子类的原型指向父类的 prototype）

- `Child.__proto__` 指向了 `Parent`，继承静态方法/属性

```js
class Parent {}
class Child extends Parent {}

Child.prototype.__proto__ === Parent.prototype; // true
Child.__proto__ === Parent; // true
```

:::tip 内建类相互间不继承静态方法
如 Array 继承自 Object，可调用`Object.prototype`的方法。但`Array.[[Prototype]]`并不指向 Object，因而没有诸如`Array.keys()`等静态方法
:::

:::tip 类语法允许在 extends 后指定任意表达式

常用于高级编程模式中，根据条件动态生成类。例如：

```js
function f() {
	return class {
		sayHi() {
			console.log("Hello");
		}
	};
}

class User extends f() {}
new User().sayHi(); // Hello
```

:::

### 重写方法

子类可重写父类的方法；也可不完全替换，而是在父类方法的基础上调整或扩展功能（如在方法体中调用父类方法），JS 提供了 super 关键字：

- 通过 `super.[method](...)` 来调用父类方法
- 通过 `super(...)` 来调用父类 constructor（只能在子类 constructor 中）

:::tip 箭头函数没有自己的 super
但可从定义时的上下文中获取

```js
class Parent {
	say() {
		console.log("Hello");
	}
}
class Child extends Parent {
	say = () => {
		super.say();
	};
}
let child = new Child();
setTimeout(child.say, 500);
```

:::

### 重写 constructor

子类可不定义 constructor，此时将调用父类 constructor 并传递所有参数，等价于：

```js
class Child extends Parent {
	constructor(...args) {
		super(...args);
	}
}
```

但若定义了 constructor，则必须调用 `super(...)`，**且必须在使用 this 前**。原因如下：

_继承类（或称派生构造器，derived constructor）具有特殊内部属性 `[[ConstructorKind]]:"derived"`，其构造函数不同于常规函数：当通过 new 执行常规函数时，将创建一个空对象并将其赋值给 this；而当执行继承类的 constructor 时，该工作会由父类的 constructor 来完成_

_因此派生的 constructor 必须通过调用 super 执行其父类（base）的 constructor，否则 this 指向的对象将不会被创建，并且会收到报错_

### 重写类字段

类字段的初始化顺序：

- 基类中，在构造函数调用前
- 派生类中，在调用 `super()` 后

由于子类的类字段在父类构造器执行时尚未初始化，因此哪怕前者已被重写，后者也只会用到自己的值（这点不同于方法）。例如：

```js
class Parent {
	name = "parent";
	constructor() {
		console.log(this.name);
	}
}
class Child extends Parent {
	name = "child";
}
new Child(); // parent

// 改用方法
class Parent {
	constructor() {
		this.say();
	}
	say() {
		console.log("parent");
	}
}
class Child extends Parent {
	say() {
		console.log("child");
	}
}
new Child(); // parent
```

### 内部机制

JS 有内部属性`[[HomeObject]]`，在对象方法（含 constructor ）中指向其所在对象。super （也仅有 super）使用该属性来解析父原型及其方法而非 this

`[[HomeObject]]` 在方法被创建时绑定，而后不可更改。因而若方法内有用到 `super`，则不建议将其复制给另一对象（为方法），`super` 始终指向其定义时所在对象的原型

:::warning 方法不是函数类型的属性
方法必须形如 `{ xxx() { ... } }`，而非 `{ xxx: function() { ... } }`，后者未设置 `[[HomeObject]]`，内部无法调用 `super.[method]`
:::

### 受保护与私有的类字段/方法

一般通过 getter/setter 或 get.../set...函数（通常首选）让外部间接访问/设置

- 受保护类字段/方法以 \_ 为前缀，非语言级强制，仅为约定：

  - **不应**被外部访问

  - 可被继承

- 私有类字段/方法以 # 开头（新特性，注意 # 非名称的一部分），语言级强制：

  - **无法**从外部访问，（在内部）不能通过 `this['#name']` 形式访问

  - 不会被继承

  - 与同名公有属性/方法不冲突

## 扩展内建类

内建类（Array，Map...）也是可扩展的。例如一个继承自 Array 的扩展类：

```js
class ExtendedArray extends Array {
	isEmpty() {
		return this.length === 0;
	}
	static get [Symbol.species]() {
		//	return Array / this
	}
}
const extendedArr = new ExtendedArray(1, 2, 3, 4, 5);
extendedArr.isEmpty();

const filteredArr = extendedArr.filter((item) => item > 10);
filteredArr.isEmpty();
```

注意其实例方法 filter 返回的同样是该扩展类而非基类（ Array）的实例，原因在于方法内部使用了扩展类来创建结果数组。此逻辑可通过子类的静态 getter `Symbol.species` 来定制，其返回值将作为实际 constructor（其他集合如 Map 和 Set 也是同理）

## Mixin 模式

Mixin 为面向对象编程术语，即一个包含其他类所用方法的类

JS 不支持多重继承，一个对象只能有一个 `[[Prototype]]`，但可通过构造 mixin（即一个拥有方法的对象）并将其方法合并到原型来实现类的扩充（这也可能导致现有类方法被意外覆盖）

另外 mixin 自身也可实现继承，拥有自己的原型：

```js
const mixinProto = {
	say(name) {
		console.log(name);
	},
};

const mixin = {
	__proto__: mixinProto,

	sayHi() {
		super.say(`Hello ${this.name}`);
	},
	sayBye() {
		super.say(`Bye ${this.name}`);
	},
};

class User {
	constructor(name) {
		this.name = name;
	}
}

Object.assign(User.prototype, mixin);
new User("Dude").sayHi();
```
