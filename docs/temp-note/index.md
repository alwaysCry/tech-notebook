# 琐碎技术细节收纳

## 常见希腊字母

- alpha（α）：角度、系数、角加速度
- beta（β）：角度、磁通系数、系数
- gamma（γ）：角度、电导系数、比热容比
- delta（δ）：变化量、屈光度、一元二次方程中的判别式
- epsilon（ε）：对数之基数、介电常数
- zeta（ζ）：系数、方位角、阻抗、相对粘度
- theta（θ）：角度、温度
- iota（ι ℩）：微小、一点
- lambda（λ）：体积、波长、导热系数
- sigma（σ ς）：总和、表面密度、跨导、正应力
- upsilon（υ）：位移
- phi（φ）：角、磁通、透镜焦度、热流量
- psi（ψ）：角速、介质电通量
- omega（ω）：角速度、欧姆、交流电的电角度

## 直接在对象原型上添加方法可能产生副作用

例如在 `Array.prototype` 上（会影响 for...in 循环结果）。更推荐下方式：

```js
Object.defineProperty(Array.prototype, "fnName", {
	enumerable: false,
	value: function () {
		// ...do something
	},
});
```

:::warning 注意
不可用该方式重复添加同一属性
:::

## 关于 `<button>` 的 type

`<button>` 的 type 特性具有三个可选值：submit（默认）、reset、button，因此在表单中若不想附带默认行为，就指定 `type="button"`

## 关于 `<a>` 元素

- `<a href=""></a>` 点击后刷新当前页
- `<a href="#"></a>` 点击后回到页面顶部
- `<a href="Javascript:void(0)"></a>` 点击无任何效果，相较 `<a href="Javascript:;"></a>` 的合理化写法

后两条也可用作占位，表示链接需动态生成，稍后才能赋值

## arguments 变量

可在函数中（除箭头函数）访问类数组对象（可迭代） arguments，其以形参在参数列表中的索引为键，存储所有实参。常出现于一些老代码中。例如：

```js
function showName() {
	console.log(arguments.length);
	console.log(arguments[0]);
	console.log(arguments[1]);
}

// 依次 log 2，Julius，Caesar
showName("Julius", "Caesar");
```

- 可通过`arguments.length`获知当前函数被传入了多少实参
- 可通过 `[函数名].length` 获知该函数（包括箭头函数）定义的形参个数

## str.slice(start [, end]) 方法

- 按前闭后开截取
- 若无 end 参数，则会截取到字符串末尾；
- 若 start/end 为负值，则意为起/始位置从字符串结尾开始计算

## str.replace(str|regexp,str|func)

字符串通用操作方法。首参可为字符串或正则，为前者时只替换第一个匹配项。例如：

```js
"12-34-56".replace("-", ":"); // 12:34-56
// 若要替换所有连字符，应使用带 g 修饰符的正则表达式 /-/g
"12-34-56".replace(/-/g, ":"); // 12:34:56
```

次参可为替换字符串或函数，为前者时可用如下符号：

| 符号      | 替换字符串中的行为               |
| --------- | -------------------------------- |
| $&        | 插入整个匹配项                   |
| $`        | 插入匹配项前的字符串             |
| $'        | 插入匹配项后的字符串             |
| $n        | 插入第 n 个捕获组的内容          |
| $\<name\> | 插入名为 name 的命名捕获组的内容 |
| $$        | 插入字符 $                       |

例如：

```js
"John Smith".replace(/(john smith)/i, "$2, $1"); // Smith, John
```

当次参数为函数时，会在每次匹配时被调用，并传入以下实参，返回值将作为替换字符

1. match —— 匹配项
2. p1, p2, ..., pn —— 捕获组的内容（如有）
3. offset —— 匹配项的位置
4. input —— 源字符串
5. groups —— 具有命名的捕获组的对象（如有）

例如：

```js
"html and css".replace(/html|css/gi, (str) => str.toUpperCase()); // HTML and CSS

// 将每个匹配项替换为其在字符串中的位置
"Ho-Ho-ho".replace(/ho/gi, (match, offset) => offset); // 0-3-6

"John Smith".replace(/(\w+) (\w+)/, (match, name. surname) => `${surname}, ${name}`) // Smith, John

// 当存在命名捕获组时
"John Smith".replace(/(?<name>\w+) (?<surname>\w+)/, (...match) => {
	const groups = match.pop()
	return `${groups.surname}, ${groups.name}`
}) // Smith, John
```

### 原型相关判断

- `obj.constructor` 通常指向对象的构造函数，但不保证一定正确

- `obj instanceOf Class` 的逻辑为检查 `Class.prototype` 是否位于 obj 的原型链中，等价于：

  ```
  obj.__proto__ === Class.prototype
  obj.__proto__.__proto__ === Class.prototype
  obj.__proto__.__proto__.__proto__ === Class.prototype
  ...
  // 一个个比较，若任意一个为 true，则返回 true
  ```

- `objA.isPrototypeOf(objB)`，若 objA 位于 objB 的原型链中，则返回 true

<!-- ### Array() 构造器

可用 `new Array([...elementN | arrayLength])` 的方式创建数组（可不加 new）：

- **...elementN**：根据给定元素创建数组，但不适用于仅有一个数字类型参数的情况

- **arrayLength**：若传入的唯一参数为 0-2^32 - 1（包括）间的整数，则将返回一个 length 为前者的空槽数组（并不包含任何元素且 for...in 循环在其上找不到任何属性）

```js
const arr1 = new Array(3); // [空槽 × 3]
// 遍历时会跳过空槽，因此
arr1.forEach((_, index) => console.log(index)); // 什么都不会发生
arr1.map((_, index) => index); // [空槽 × 3]

// new Array(3) 等价于
const arr2 = [];
arr2.length = 3;

// JS 实际是将元素作为标准对象属性来存储，数组索引作为属性名
// length 属性较为特殊，其值总等于最后一个元素的索引 + 1
arr2[30] = ["cat"];
arr2.length; // 31

// 可以为 length 属性赋值
// 赋一个小于元素数量的值将截断数组
const cats = ["Dusty", "Misty", "Twiggy"];
cats.length = 2;
cats; // ['Dusty', 'Misty']

// 赋 0 会彻底清空数组
cats.length = 0;
cats; // []
``` -->

## 事件冒泡中经过的元素

为获取事件冒泡中经过的所有元素：

- Chrome 和 Opera 中可通过 `event.path`
- Firefox 和 Safari 中可通过 `event.composedPath()`

```js
const path = event.path || (event.composedPath && event.composedPath());
```

## 关于 for...in 循环

for..in 循环会迭代包含继承属性在内的所有**可枚举、非 Symbol 属性**（通常如 Object.prototype、Array.prototype 的属性都带不可枚举标志），因而不适合遍历数组

若只考虑自身属性，可在循环体内通过 `obj.hasOwnProperty(key)` 来过滤

而其他几乎所有获取键/值方法，如 `Object.keys`、`Object.values`、`Object.entries`，都会忽略继承的属性

## 判断 JS 对象是否为 DOM

```js
// 最低兼容至 IE8，支持 HTML 与 SVG
// 跨窗口解决方案：win = window.open(); win.document.body instanceof win.ELement
// 参见：https://stackoverflow.com/questions/384286/how-do-you-check-if-a-javascript-object-is-a-dom-object
function isElement(element) {
	return element instanceof Element || element instanceof HTMLDocument;
}
```

## JS 创建 SVG DOM

使用 `document.createElementNS` 方法，如：

```js
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
```

## innerText 与 textContent 的区别

PC 端获取元素文本内容通常：`var text = dom.innerText || dom.textContent`（兼容性考虑）；而通过二者设置内容均无法解析 script 标签（防 XSS，但 innerHTML 可以，所以要小心）

二者区别在于：

1. innerText IE6 开始支持，而 textContent 要到 IE9

2. innerText 只有 HTML 元素才可调用，而 textContent 任意 Node 节点都可以

3. innerText 会保留可能存在的换行符，而 textContent 不会。例如`<p id="p">内容<span style="position:absolute;">...</span></p>`（注意`<span>`虽为内联元素，但`position:absolute`会使其 display 计算值变为 block）[详情参见](https://www.zhangxinxu.com/study/201909/innerText-textContent-demo.php)：

- 若 white-space 不为 pre 或 pre-wrap 则：

  ![](./assets/innerText-vs-textContent.png)

- 若 white-space 为 pre 则：

  ![](./assets/innerText-vs-textContent-2.png)

4. innerText 会识别样式，而 textContent 不会。如前者无法获取`display:none`元素内容，而后者可以。[详情参见](https://www.zhangxinxu.com/study/201909/innerText-textContent-demo.php)

5. innerText 会忽略元素中的 style、script 标签，而 textContent 不会

6. 读取 innerText 将**触发回流**（因为要识别标签和样式）；而 textContent**单纯读取文本内容**，性能更高

7. IE 下 innerText 表现与 textContent 一致（不随规范），即上面 3、4 在 IE 下不会有差异；另外 IE 中更改 innerText 将会移除其子节点，并永久销毁所有子文本节点，无法再将节点插入任何其他元素或同一元素中

结论：获取或改变文本内容更推荐 textContent（除兼容性考虑）
