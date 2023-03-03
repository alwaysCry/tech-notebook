# 原型概述

JS 对象有一个特殊隐藏属性 `[[Prototype]]`，或为 null，或为另一对象引用，后者称为**原型**。当从对象中读取缺失属性时，JS 会尝试从原型中获取该属性，此行为即原型继承

`[[Prototype]]` 是内部且隐藏的，但可通过 `__proto__` 来设置。注意后者本质是前者的 getter/setter，更多是出于历史原因而存在，当下更建议使用 `Object.getPrototypeOf/setPrototypeOf` 方法来读取/设置原型

原型有如下特点：

- 不能闭环引用，否则会抛错

- `__proto__` 只可为对象或 null，其他类型会被忽略

- 仅用于属性的读取，而（等号）赋值以及删除（delete）操作则直接作用于对象自身

- 不影响 this：无论是方法（或 setter）源自对象自身或是原型，this 始终指向 `.` 前面的对象（方法共享但对象状态不是）

- 对现代引擎而言，从对象或是原型链中获取属性从性能上并无区别

## F.prototype

当使用 `new F()` 形式创建新对象时，若 `F.prototype` 为一对象，则后者将**赋值**给新对象的原型（注意 `F.prototype` 实质并非原型，若其指向发生变化，已创建对象仍将维持旧有原型）

每个函数都有 prototype 属性，默认为一个只含 constructor 属性的对象，后者指向函数自身。该特性常被用于创建一个与现有对象（通常来自三方库）类似的对象

```js
function Rabbit() {}
Rabbit.prototype; // { constructor: Rabbit };

let rabbit = new Rabbit();
let rabbit2 = new rabbit.__proto__.constructor();
```

当然 JS 无法确保 constructor 指向始终不变，因而开发中通常：

- 在 `F.prototype` 中增减属性，而非将其整个覆盖
- 或者在覆盖时手动指定 constructor 的指向

所有内建对象都遵循以下模式：

- 方法存储于 prototype 中（Object.prototype、Array.prototype、Date.prototype 等）
- 对象自身只存储数据（对象属性、数组元素、日期等）

:::tip Object.prototype 没有原型

```js
Object.prototype.__proto__; // null
```

:::

对基本类型而言：

- Number、String、Boolean 类型的方法同样位于相应构造器的 prototype 中。被调用时将创建一个包装对象，提供相应方法后消失

- undefined 和 null 没有构造器，也不存在方法和属性

通常不建议修改内建对象的 prototype（如增减方法），唯一例外是 polyfilling

## 指定原型

直接创建对象（不通过构造器）并指定其原型的方法有两种：

- 字面量形式：`{ __proto__: ... }`

- `Object.create(proto, [descriptors])`：以 proto 为原型创建一个对象，还可指定属性描述符。也由此衍生出了浅拷贝对象所有（含不可枚举、Symbol、访问器）属性及其标志，并共享原型的方式：

  ```js
  const clone = Object.create(
  	Object.getPrototypeOf(source),
  	Object.getOwnPropertyDescriptors(source)
  );
  ```

:::warning 不推荐修改已存在对象的原型
JS 引擎内部优化了对象属性的访问操作，而 `Object.setPrototypeOf` 或 `obj.__proto__` 动态修改原型（尽管技术上可行）会破坏这些优化，造成执行上的缓慢
:::

还可使用 `Object.create(null)` 或 `{__proto__: null}` 创建无原型对象，后者常被用作字典，存储任意（主要是用户生成的）键
