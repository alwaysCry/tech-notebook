# 页面生命周期概述

页面生命周期包含以下重要事件：

- **DOMContentLoaded**：浏览器已完全加载 HTML，并构建 DOM 树，但 `<img>` 与样式表等外部资源可能尚未

  - 提示：因 DOM 已就绪，此时脚本可查找 DOM 节点，并初始化接口

- **load**：除 HTML 外，还完成了所有外部资源（图片，样式...）的加载

  - 提示：样式已被应用，图片大小就已确定

- **beforeunload** ：用户正在离开

  - 提示：可检查是否保存了更改，并询问是否真的要离开

- **unload**：用户（几乎）已离开

  - 提示：如发送统计数据等操作

## DOMContentLoaded

发生在 document 对象上，且必须用 `addEventListener` 来监听

### 与脚本和图片

脚本会阻塞 `DOMContentLoaded` （脚本可能要 DOM）而图片不会

```html
<img id="img" src="https://en.js.cx/clipart/train.gif?speed=1&cache=0" />
<script>
	document.addEventListener("DOMContentLoaded", () => {
		// 图片尚未加载完成（除非已被缓存），因此大小为 0x0
		console.log(`img size:${img.offsetWidth}x${img.offsetHeight}
    `);
		// DOMContentLoaded 会在脚本加载并执行结束后触发，因此存在 lodash 对象
		console.log(window._);
	});
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.3.0/lodash.js"></script>
```

:::tip 两个例外：

- 具有 async 特性的脚本不会阻塞 DOMContentLoaded
- 使用 `document.createElement('script')` 动态生成并添加的脚本也不会

:::

### 与样式

外部样式不会影响 DOM，因而不会**直接**阻塞 `DOMContentLoaded`，除非：样式表后存在脚本，则此脚本会等待其加载完成（可能要获取元素样式）—— 也间接阻塞了`DOMContentLoaded`

```html
<link type="text/css" rel="stylesheet" href="style.css" />
<script>
	// 上面样式表完成加载前，脚本不会执行
	console.log(getComputedStyle(document.body).marginTop);
</script>
```

### 与浏览器自动填充

Firefox、Chrome 和 Opera 会在 `DOMContentLoaded` 中自动填充表单，例如：

页面有带登录名和密码的表单，且浏览器记住了这些值，则其会在`DOMContentLoaded` 中尝试自动填充它们（若得到了用户允许）

因此，若 `DOMContentLoaded` 被（脚本）阻塞较久，则自动填充也会等待

## load

整个页面，包括样式、图片及其他资源完成加载时，会触发 window 对象的 load 事件。可通过 `window.onload` 监听。例如：

```html
<script>
	//  也可用 window.addEventListener('load', (event) => {...})
	window.onload = function () {
		// 此时图片已加载完成，可获取正确大小
		console.log(`img size: ${img.offsetWidth}x${img.offsetHeight}`);
	};
</script>
<img id="img" src="https://en.js.cx/clipart/train.gif?speed=1&cache=0" />
```

## beforeunload

用户触发离开页面的导航（navigation）或试图关闭窗口，会触发 window 对象的 beforeunload 事件。若取消该事件，则浏览器会询问用户是否确定

```js
window.onbeforeunload = function () {
	return false;
};
```

:::warning 注意
`event.preventDefault()` 在此不起作用，即以下代码无效

```js
window.addEventListener("beforeunload", (event) => {
	// 不起作用
	event.preventDefault();
});
```

:::

## unload

用户离开页面会触发 `window` 的 unload 事件，常在此做些不涉及延迟的操作，如关闭相关的弹出窗或发送分析数据：

例如收集页面使用情况数据（点击、滚动、被查看区域等），在用户要离开时（unload）保存至服务器。此时用 `navigator.sendBeacon(url, data)` 最合适(详见[规范](https://w3c.github.io/beacon/))，其向后台发送数据，同时不会延迟页面切换，即使浏览器离开页面也仍在执行。特性：

- 以 POST 方法发送。
- 能发送字符串、表单以及其他格式数据(参见 [Fetch](https://zh.javascript.info/fetch))，但通常是一个字符串化的对象
- 数据大小限制在 64kb
- 无法获取服务器响应（完成请求时，浏览器可能已离开文档）
<!-- - 拥有 keep-alive 标志（在 `fetch` 中为通用网络请求执行此类“离开页面后”的请求。参见 [Fetch](https://zh.javascript.info/fetch)章节） -->

例如：

```js
const analysis = {}; // 收集的数据对象
window.addEventListener("unload", function () {
	navigator.sendBeacon("/analytics", JSON.stringify(analysis));
});
```

## readyState

`document.readyState`提供当前加载状态，可在`readystatechange`事件中跟踪其变化，3 个可能值：

- **loading**：文档正被加载
- **interactive**：文档已加载完成，先于`DOMContentLoaded`（几乎同时）
- **complete**：文档和所有资源（如图片等）均已加载完成，先于`load`(几乎同时)

一用途为判断是否可设置 `DOMContentLoaded` 监听（值为 loading 时设置才有意义），例如：

```js
function work() {
	/* ... */
}

if (document.readyState === "loading") {
	// 仍在加载
	document.addEventListener("DOMContentLoaded", work);
} else {
	// DOM 已就绪
	work();
}
```

## 完整事件流示例

```html
<script>
	console.log("initial readyState:" + document.readyState);

	document.addEventListener("readystatechange", () =>
		console.log("readyState:" + document.readyState)
	);
	document.addEventListener("DOMContentLoaded", () =>
		console.log("DOMContentLoaded")
	);

	window.onload = () => log("window onload");

	<iframe src="iframe.html" onload="console.log('iframe onload')"></iframe>;

	<img src="http://en.js.cx/clipart/train.gif" id="img">
</script>

<script>
	img.onload = () => console.log("img onload");
</script>
```

其典型输出如下，方括号数字表大致顺序，相同数字事件看看作同时发生的（+-几毫秒）

1. [1] initial readyState:loading
2. [2] readyState:interactive
3. [2] DOMContentLoaded
4. [3] iframe onload
5. [4] img onload
6. [4] readyState:complete
7. [4] window onload

- `document.readyState` 会在 `DOMContentLoaded` 前变为 interactive，二者实际意义相同
- 所有资源（iframe、img）加载完后，`document.readyState` 变成 complete，与 `img.onload`（最后一个资源）和 `window.onload` 几乎同时，其意义与 `window.onload` 相同，但后者始终在其他 load 事件后
