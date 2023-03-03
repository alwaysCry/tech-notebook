# DOM API 转义/反转义 HTML 字符

## 转义

```js
const textNode = document.createTextNode("<span>carousel</span>");
const div = document.createElement("div");
div.append(textNode);
console.log(div.innerHTML);
```

输出结果为：

```
&lt;span&gt;carousel&lt;/span&gt;
```

即将 HTML 字符作为文本节点的内容，再通过 innerHTML 属性返回即可

## 反转义

需要用到 DOMParser API，代码示意：

```js
const str = "&lt;span&gt;carousel&lt;/span&gt;";
const doc = new DOMParser().parseFromString(str, "text/html");
console.log(doc.documentElement.textContent);
```

结果就是:

```
<span>carousel</span>
```

另一种方法是借助 textarea 元素，这是 IE 时代常用的一种方法，代码示意如下：

```js
const textarea = document.createElement("textarea");
textarea.innerHTML = "&lt;span&gt;carousel&lt;/span&gt;";
console.log(textarea.childNodes[0].nodeValue);
```

结果也是一样的

## 缺点

DOM API 方法利用了浏览器的能力，更容易上手，结果也更安全，但不足在于只能在浏览器环境中使用。若在 Service Workers 或 Node.js 环境中，就只能使用传统的字符串处理方法了：

```js
/**
 * 转义HTML标签
 * @param {string} str
 * @return {string}
 */
function encodeHTML(str) {
	if (typeof str !== "string") return "";

	return str.replace(
		/<|&|>/g,
		(matches) =>
			({
				"<": "&lt;",
				">": "&gt;",
				"&": "&amp;",
			}[matches])
	);
}

/**
 * 反转义HTML标签
 * @param {string} str
 * @return {string}
 */
function decodeHTML(str) {
	if (typeof str === "string") return "";
	return str.replace(
		/&lt;|&gt;|&amp;/g,
		(matches) =>
			({
				"&lt;": "<",
				"&gt;": ">",
				"&amp;": "&",
			}[matches])
	);
}
```
