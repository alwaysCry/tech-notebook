# 数据/访问器属性及其标志

**注：以下涉及属性均来源于对象自身，而非原型链！！！**

对象属性可分为：数据属性和访问器属性

## 数据属性的标志

对象的**数据属性**除 value 外，还有三个属性标志：

- **writable**：若为 true 则值可被修改；否则只读（**严格模式下赋值会报错**）

- **enumerable**：若为 true 则可被在循环（for...in 和 Object.keys() 等）中列出；否则不会

- **configurable**：若为 true 则该属性可被删除，其特性也可被修改；否则不可（在部分内建对象属性中预设，如 Math.PI）。要点：
  - `configurable: false` 时无法再通过 defineProperty 将其改回 true，但仍可更改其值（value）
  - 唯一例外：此时若 `writable: true`，则允许改为 false（相当于多加一层保护，不可反向）

用通常方式（如字面量）创建属性时，以上皆为 true

`Object.getOwnPropertyDescriptor(obj, propertyName)` 用于获取属性描述符（包含值和所有标志）：

- **obj**：所在对象
- **propertyName**：属性名称

`Object.defineProperty(obj, propertyName, descriptor)` 用于在属性存在时更新其标志，否则用给定的值和标志创建属性（**此时缺省标志默认 false**）

- **obj**、**propertyName**：所在对象及相应属性
- **descriptor**：待附加的属性描述符对象

```js
// 获取属性描述符
let user = { name: "John" };
Object.getOwnPropertyDescriptor(user, "name"); // {value: 'John', writable: true, enumerable: true, configurable: true}

// 创建/更新属性标志
user = {};
Object.defineProperty(user, "name", { value: "John" });
let descriptor = Object.getOwnPropertyDescriptor(user, "name"); // { "value": "John" }
```

`Object.defineProperties(obj, { prop1: descriptor1, prop2: descriptor2, /*...*/ });` 用于一次定义多个属性

同理，`Object.getOwnPropertyDescriptors(obj)` 用于一次获取**所有属性**的描述符（包含 symbol 类型与不可枚举属性）

:::tip 提示
常规拷贝对象的方式并不会连带复制属性标志，但可通过如下方式：

```js
Object.defineProperties(target, Object.getPropertyDescriptors(source));
```

:::

## 访问器属性的标志

除数据属性外对象还可有访问器属性，其标志如下（无 value 和 writable）：

- **get**：无参函数，在读取属性时调用
- **set**：带参（1 个）函数，当属性被设置时调用
- **enumerable**： 与数据属性相同
- **configurable**： 与数据属性相同

1. 同样可用 defineProperty 来创建（**enumerable、configurable 缺省值为 false**），如：

```js
let user = {
	name: "John",
	surname: "Smith",
};

Object.defineProperty(user, "fullName", {
	get() {
		return `${this.name} ${this.surname}`;
	},
	set(value) {
		[this.name, this.surname] = value.split(" ");
	},
});
```

2. 也可用字面量形式（**enumerable、configurable 默认为 true**），例如：

```js
let obj = {
	get propName() {}, // 读取 obj.propName 时，触发 getter

	set propName(value) {}, // 当执行 obj.propName = value 时，触发 setter
};
```

**注意：属性要么为访问器属性（具有 get/set 方法），要么是数据属性（具有 value），不能两者兼有**

## 密封对象相关方法

以下为限制访问**整个**对象的方法：

- `Object.preventExtensions(obj)`：禁止对象添加新属性

- `Object.seal(obj)`：禁止添加/删除属性，为所有现有属性设置 `configurable: false`

- `Object.freeze(obj)`：禁止添加/删除/更改属性，为所有现有属性设置 `configurable: false` 和 `writable: false`

- `Object.isExtensible(obj)`：若对象可添加属性则返回 true，否则返回 false

- `Object.isSealed(obj)`：若对象被 seal 则返回 true

- `Object.isFrozen(obj)`：若对象被 frozen 则返回 true
