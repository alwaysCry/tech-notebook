# 脚本与资源加载概述

浏览器中的外部资源包括脚本、iframe、图片等

## 脚本加载策略

浏览器解析 HTML 时遇到 `<script>` 标签就会被阻塞并执行此脚本，对于外部脚本也是如此 —— 且要先等待脚本下载完毕。这导致了以下问题：

- 脚本不能访问其所在标签以下的 DOM 元素，也无法为后者添加处理程序
- 较大的脚本会阻塞页面，在其下载并执行结束前，用户无法看到页面内容

有解决方法将脚本置于页面底部（可访问其上方元素，也不会阻塞页面显示内容），但也远非完美。浏览器只在下载完整 HTML 后才处理并下载该脚本，若 HTML 较长可能造成明显延迟，尤其在较慢网速下

有两个 `<script>` 特性可帮助解决此问题：defer 和 async（均只适用于远程脚本）

### defer

defer 特性告知浏览器无需等待此脚本，继续处理 HTML 构建 DOM。而脚本在后台下载，等 DOM 构建完后才执行。换而言之：

- 不会阻塞页面
- 会等 DOM 解析完毕，并在 DOMContentLoaded 事件前执行完毕（该事件会等待此脚本执行完成）
- 具有此特性的脚本会确保执行的相对顺序，虽然下载是并行的

适用于需要完整 DOM，或彼此间相互依赖的脚本

### async

async 特性同样让脚本不阻塞页面，加载就绪即执行，同时使其完全独立：

- 不会阻塞页面
- DOMContentLoaded 事件与该脚本不会彼此等待
- 其他脚本不会等待 async 脚本加载完成，反之亦然

适用于独立脚本，如广告等

### 动态脚本

此外还可使用 JavaScript 动态创建一个脚本，并将其插入到文档中，脚本会立即开始加载。动态脚本的行为默认是异步的，即：

- 不会等待任何东西，也没有什么东西会等它们
- 先加载完成先执行

但可通过设置 `script.async=false` 来改变，脚本将照其在文档中的顺序执行（如同 defer），例如：

```js
function loadScript(src) {
	const script = document.createElement("script");
	script.src = src;
	script.async = false;
	document.body.append(script);
}

// long.js 先执行，即使其下载较慢
loadScript("/article/script-async-defer/long.js");
loadScript("/article/script-async-defer/small.js");
```

## 资源加载事件

`<script>`、`<img>`、`<iframe>`提供**load**、**error**事件跟踪相关外部资源的加载，要点：

- `<script>`、`<iframe>`在被添加到文档后开始加载；而`<img>`**是在获得 src 后**（在`img.src=...`时，浏览器已开始加载图片，并存于缓存中）
- `<iframe>` 只触发 load 事件，无论加载成功或失败（历史原因）
- 无法从 error 事件中获取 HTTP 相关信息，例如状态码
- error 事件无法跟踪脚本中的编程 error，后者可通过 `window.onerror` 全局处理

## 跨源策略

一个源（域/端口/协议三者）无法获取另一个源（origin）的内容，即使是不同子域或端口。此规则也会影响资源：

若使用其他源的脚本，且其中存在 error，则无法获取后者的详细信息（堆栈跟踪等）。其他类型资源也存在类似跨源策略（CORS，详情参见[此文](https://zh.javascript.info/fetch-crossorigin)）

要允许跨源访问，`<script>` 需具有 crossorigin 特性，且远程服务器须提供特殊的 header。三个级别：

- 无 crossorigin 特性：禁止访问
- `crossorigin="anonymous"`：浏览器不会发送授权信息和 cookie，若服务器响应头`Access-Control-Allow-Origin`包含 \* 或请求源，则允许访问，
- `crossorigin="use-credentials"`：浏览器会发送授权信息和 cookie，若服务器响应头`Access-Control-Allow-Origin`包含请求源且 `Access-Control-Allow-Credentials: true`，则允许访问，
