# 模块（Module）概述

JavaScript 长时间没有语言级模块语法，当然早期脚本既小且简单，也无必要；而当脚本变得越发复杂时，社区发明了多种方法将代码组织于模块中，使用相应的库按需加载。一些列举：

- **AMD**：最古老的模块系统之一，最初由 require.js 实现
- **CommonJS**：为 Node 端创建的模块系统
- **UMD**：通用的模块系统，与 AMD 和 CommonJS 兼容

现在它们开始慢慢走进历史，语言级模块系统于 2015 年出现在标准（ES6）中，并逐渐发展，现已经得到了所有主流浏览器和 Node.js 的支持

## 什么是模块？

一个模块（module）就是一个文件，一个脚本就是一个模块。模块可以相互加载，并使用特殊指令 export 和 import 来交换功能：

- export 关键字标记了可从外部访问的模块变量及函数
- import 关键字允许从其他模块导入功能

模块支持特殊关键字和功能，其脚本须通过 `type="module"` 特性告知浏览器：须被当作模块对待

:::warning 模块只通过 HTTP(s) 工作
若通过 file:// 协议在本地打开网页，则 import/export 指令不起作用
:::

## 模块核心功能

相比常规脚本，模块有以下一些核心功能，对浏览器/服务端 JavaScript 都有效

### 始终使用 “use strict”

模块始终在严格模式下运行。例如，对一未声明变量赋值将产生错误（浏览器控制台可见 error 信息）

### 模块级作用域

每个模块都有其顶级作用域（top-level scope），一个模块中的顶级变量/函数在其他脚本中不可见。应使用导入/导出而非依赖全局变量

### 模块代码仅在第一次导入时被解析

同一模块被导入到多个位置，其代码也只会执行一次，即第一次被导入时，几个例子：

1. 若模块中的代码会带来副作用（side-effect），如显示一条消息，则多次导入该模块只会在第一次触发显示 —— 规则：模块顶层代码应用于初始化，创建模块特定的内部数据结构。某些逻辑若需多次调用，应将其以函数形式导出

2. 若一个模块导出一对象，并被导入到多个文件中，则其仅在第一次导入时被解析，创建导出对象。所有导入获得的是同一个导出对象

### import.meta

`import.meta`对象包含当前模块的元信息，其内容取决于所在环境。在浏览器环境中包含此脚本 URL，若脚本内联于 HTML 则为当前页面 URL

### 模块中顶级 this 为 undefined

相较于非模块脚本的顶级 this 为全局对象（window）

## 浏览器特定功能

相比常规脚本，拥有 `type="module"` 标识的脚本有一些特定于浏览器的差异

### 模块脚本默认 defer

模块脚本默认具有 defer 特性（参见[# 脚本与资源加载概述](/javascript-info/load-resource)），不论外部或内联（inline）。即：

- 外部模块脚本的加载不会阻塞 HTML 的处理，而会与其他资源并行加载，但会等到 HTML 完全就绪再运行
- 保持脚本的相对顺序：前面的脚本先执行
- 模块脚本可见完整 HTML，包括其下方的元素

### 内联模块脚本也可 async

不同于非模块脚本，模块脚本即使内联也可用 async 特性

### 外部模块脚本

外部模块脚本以下不同：

- 具有相同 src 的外部脚本仅运行一次：
- 跨源外部脚本需要 CORS header，即服务器必须提供`Access-Control-Allow-Origin`头

### 不允许裸模块（bare module）

无任何路径的模块被称为裸模块。浏览器中，import 必须给出相对或绝对路径，不许出现
裸模块。例如以下 import 无效：

```js
import { sayHi } from "sayHi";
```

### 兼容性

旧浏览器无法执行模块脚本，对此可用 nomodule 特性脚本提供后备（会被现代浏览器忽略）。例如：

```js
<script type="module">
  console.log("可在现代浏览器中执行");
</script>

<script nomodule>
  console.log("现代浏览器会忽略此代码")
  console.log("可在旧浏览器中执行");
</script>
```

## 导出和导入（静态）

导入/导出语句可位于脚本顶部或底部，实际中导入语句常位于脚本开头

:::warning 注意
在 {...} 中的 import/export 语句无效
:::

### 命名导出

- 可在声明语句前通过 export 标记导出：`export variable/function/class`
- 当然也可先声明，再统一导出（可用 as 重命名）: `export {x [as y], ...}`

### 默认导出

实际开发者倾向于在模块中声明单个实体，如模块 user.js 仅导出`class User`。若文件命名良好且文件夹结构得当，该方式会使代码导航（navigation）更容易

默认导出语法：`export default variable/function/class`，每个文件只能有一个

也是因此，默认导出实体无需名称。反之则以下导出报错：

```js
export class { // Error!（非默认的导出需要名称）
  constructor() {}
}
```

技术上讲，一个模块中可同时有默认导出和命名导出，但通常很少混用

#### default 作为导出名

default 关键词还可如下使用：

```js
// 等同于 export default
function sayHi(user) {
	alert(`Hello, ${user}!`);
}
export { sayHi as default };
```

#### 是否使用默认导出

命名导出是明确的：确切命名了要导出的内容，并强制使用正确的名称导入，这是好事

而默认导出总在导入时选择名称，因此团队成员可能用不同名称来导入相同内容，这不好

通常为避免该情况并使代码保持一致，可遵从此规则：导入变量应与文件名相对应。但一些团队仍认为这是默认导出的严重缺陷，而更倾向于始终使用命名导出，即使只导出单个内容

### 重新导出

重新导出（Re-export）语法：`export ... from ...` 允许导入内容并立即将其导出（可重命名），语法：

- `export {x [as y], ...} from "module"`
- `export * from "module"`（不会重新导出默认的导出）
- `export {default [as y]} from "module"`（重新导出默认的导出）

例如：

```js
// 📁 index.js
export { sayHi } from "./say.js"; // 将命名导出重新导出
export * from "./user.js"; // 将全部命名导出重新导出
export { default as User } from "./user.js"; // 将默认导出重新导出为User
// export User from "./user.js" // 错误语法
```

与 import/export 相比最明显的区别是重新导出模块在当前文件中不可用，如上例中不能在`index.js`中调用 sayHi 函数

:::tip 常见原因
参考实际开发场景：在编写包时，其中一些功能是导出的，而另一些仅供内部使用。若不希望使用者干预包内部结构或搜索其中文件，便可只在主文件中导出必要部分，并保持其他内容不可见

若实际导出分散在包中，就可使用导入-再导出的方式处理
:::

<!-- #### 重新导出默认导出

重新导出时，需对默认导出单独处理（也是某些开发者不喜欢默认导出的原因）

假设有 `user.js` 脚本，其中默认导出`class User`，若想重新导出该类可能会遇到两个问题：

1. `export User from './user.js'` 无效，会导致一个语法错误
2. `export * from './user.js'` 只重新导出了命名导出，忽略了默认导出

因此正确的处理：

1. 重新导出默认导出（上文已提及）： `export {default as User} from "./user.js";`

2. 重新导出混合导出：

```js
export * from "./user.js"; // 重新导出命名导出
export { default } from "./user.js"; // 重新导出默认导出
``` -->

### 导入

:::warning 限制
这里的导入也称静态导入，旨在提供代码结构主干以便分析其结构，因而存在以下限制：

- 不能动态生成 import 的任何参数
- 无法根据条件或者在运行时导入

:::

- 导入命名导出（可通过 as 重命名）：`import {x [as y], ...} from "module"`
- 导入默认的导出：
  - `import x from "module"`
  - `import {default as x} from "module"`
- 导入全部（命名&默认）：`import * as obj from "module"`
- 导入模块仅运行：`import "module"`

基于以下原因，建议明确列出导入内容（而非使用导入全部的语法）：

1. 现代构建工具（webpack 等）将模块打包到一起并优化，明确列出导入内容能帮助优化器（optimizer）检测并（从打包代码中）删除未被使用的函数，从而使构建更小。即所谓的摇树（tree-shaking）
2. 明确列出导入内容会使名称较短，如`sayHi()`而非`obj.sayHi()`
3. 显式的导入列表可更好概述代码结构：使用的内容和位置。使得代码支持重构，且重构更容易

### default 作为导入名

某些情况下（如混合导出的导入） default 关键词被用于引用默认导出，例如：

```js
// 📁 main.js
import { default as User, sayHi } from "./user.js"; // user.js 存在混合导出
```

或

```js
// 📁 main.js
import * as user from "./user.js";

const User = user.default; // 正是 user.js 的默认导出
```

### 动态导入

若要动态按需导入模块，可借助`import(module)`表达式(也称动态导入)，其加载模块并返回一个 promise，后者 resolve 值即为一个包含其所有导出的模块对象。可在代码任意位置调用该表达式，例如：

```js
import([modulePath])
	.then((moduleObject) => {
		/* ... */
	})
	.catch((err) => {
		/* ... */
	});
```

或在异步函数中:

```js
const module = await import([modulePath]);
```

可按如下动态导入：

```js
// 访问命名导出
const { hi, bye } = await import("./say.js");
// 访问默认导出
const obj = await import("./user.js");
const say = obj.default;
```

:::tip 提示
动态导入可在常规脚本中工作，无需 `type="module"`
:::

:::warning 注意
尽管看似函数调用，但`import()`实质还是一种特殊语法（类似于 super()），因此不能将 import 赋值到变量中，或对其使用 call/apply
:::
