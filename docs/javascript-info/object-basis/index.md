# 对象基础概述

对象<!-- 或称普通对象（plain object） -->是 JavaScript 八种数据类型之一（其余七种都是原始类型），其他诸如 Array、Date、Error 等本质都属于前者，仅对其做了一些扩展

可用以下两种语法创建空对象：

```js
let user = new Object(); // 构造函数
// 等价于
user = {}; // 字面量
```

对象操作不做赘述，一些注意点如下：

- 属性的键必须为字符串或 Symbol，其他类型会被自动转为字符串

- 属性名不受保留字限制，可为任意字符串。但点号语法要求其为**有效变量标识符**（不含空格，不含除`$`、`_`外的特殊字符，不以数字开头），否则须改用方括号语法，例如：

  ```js
  user["likes birds"] = true;
  ```

- 字面量形式创建对象时也可用方括号语法，例如：

  ```js
  const fruit = "apple";
  const basket = {
  	[fruit + "Number"]: 5,
  };
  ```

- 可用 delete 操作符删除对象属性，`delete obj.prop`

- 可用 in 操作符检查对象中是否存在给定属性，`"key" in obj`

- 不同类别属性的鉴别方式：

  - 自有属性：`Object.prototype.hasOwnProperty(key)`为 true

  - 可枚举属性：`Object.prototype.propertyIsEnumerable(key)`为 true

- 属性的罗列/迭代：

  - 可用`for ... in`循环按以下顺序迭代对象非 Symbol 可枚举属性键：

    - 整数属性（键名可不加更改地与整数相互转换，如`"49"`而非`"1.2"`）按升序

    - 否则按创建顺序

  - `Object.keys(obj)`返回对象所有非 Symbol 自有可枚举属性键（数组），顺序与`for ... in`一致

  - `Object.getOwnPropertyNames(obj)`返回对象所有非 Symbol 自有属性键（数组），顺序同上

  - `Object.getOwnPropertySymbols(obj)`返回对象所有 Symbol 自有属性键（数组），顺序同上

  - `Reflect.ownKeys`返回对象所有自有属性（数组）

## 对象的合并与拷贝

- `Object.assign(dest, [src1, src2, src3...])` 用于对象合并，该方法将剩余参数（对象`src1, ..., srcN`中的**自有可枚举属性**拷贝至第一个参数`dest`中（也可用于数组，但不推荐），同名属性会从后往前被覆盖

  可以`Object.assign({}, src)`代替`for...in`循环（遍历属性）进行浅拷贝

- spread 语法`const clone = {...src}`同样如此

- 深拷贝则可[参见](/interview/deep-copy)或直接使用 lodash 库的 [\_.cloneDeep(obj)](https://lodash.com/docs#cloneDeep)

## 对象方法及其 this 指向

存储在对象属性中的函数被称为方法（会因不同定义写法产生细微差异，[参见](/javascript-info/class/#内部机制)）

this 指向在**函数被调用时**确定：

- 方法中的 this 即为“点符号前”的对象
- 普通函数在严格模式下 this 值为 undefined；非严格模式下为全局对象（浏览器中为 window）
- 箭头函数没有自己的 this，后者取决于其被定义时所在上下文

## 构造函数与 new 操作符

除字面量形式（以及`new Object()`）外，还可通过构造函数（或称构造器） + new 操作符来创建对象（更简短易读，实质：可重用的对象创建逻辑）。构造函数本质即常规函数(非箭头)，但有两个**约定**：

- 命名以大写字母开头
- 只能由 "new" 操作符来执行

当构造函数被执行时：

1. 创建一个空对象被并分配给 this
2. 执行函数体，通常为 this 添加新属性
3. 返回 this

:::tip 立即调用构造函数
形如：

```js
let user = new (function () {
	this.name = "young.penn";
	// ...
})();
```

该技巧旨在将构建单个对象的逻辑封装，无法被复用
:::

在函数内部可使用 `new.target` 属性来检查其是否被 new 调用：常规调用为 undefined；用 new 调用，则等于该函数本身

构造函数通常无 return，但若存在时：

- 若返回对象，则实际返回前者，而非 this
- 若返回原始类型，则忽略

## 可选链

新特性，可能需要 polyfills。语法有三种形式：

- `obj?.prop`：若 obj 存在（即不为 undefined/null，下同）则返回 `obj.prop`，否则返回 undefined
- `obj?.[prop]`：若 obj 存在则返回`obj[prop]`，否则返回 undefined
- `obj.method?.()`：若`obj.method`存在则调用，否则返回 undefined

可选链不应滥用，因其可能隐藏理应被提前暴露的错误
