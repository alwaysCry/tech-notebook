# URL() 和 URLSearchParams() API 介绍

之前对 URL 做分析处理，需进行字符串解析，如：字符切割、正则匹配

事实上浏览器已有内置 API 可处理 URL，即 URLSearchParams() 和 URL()。例如获取查询参数值，可直接如下：

```js
const s = "https://www.zhangxinxu.com/wordpress/?s=url";

new URL(s).searchParams.get("s");
// 或
new URLSearchParams("?s=url").get("s");
```

兼容性如下：

![](./assets/2019-08-25_233254.png)

URL 和 URLSearchParams 分别在 Edge 12、17 开始支持，但有一直支持到 ES7 规范的 [polyfill](https://github.com/lifaon74/url-polyfill) 可用，官方说法可兼容到 IE 10+ （除 URL 的几个静态方法外也基本支持 IE9）

## URLSearchParams()语法

```js
// URL查询字符串
const urlSearchParams = new URLSearchParams(strSearchParams);
// 查询字符序列
const urlSearchParams = new URLSearchParams(arrSearchSequence);
// 查询键值对象
const urlSearchParams = new URLSearchParams(objSearchKeyValue);
```

- strSearchParams：URL 查询字符串，形如 `"?s=url"`。例如可直接使用 `location.search`
- arrSearchSequence: 数组形式的查询字符序列，例如：`[['s', 'url'], ['someId', 1]]`
- objSearchKeyValue：键值对形式的查询对象，例如`{"s": "url", "someId": 2}`

以上执行后的返回值 urlSearchParams 即 URLSearchParams 实例，包含众多方法，具体如下：

- URLSearchParams.append(name, key)：添加新的键值对作为查询参数，例如：

```js
// 也可以没有问号直接's=url'
const params = new URLSearchParams("?s=url");
params.append("from", "zxx");
// 此时的查询字符串是：'s=url&from=zxx'
```

- URLSearchParams.delete(name)：删除已存在的查询参数，例如：

```js
const params = new URLSearchParams("?s=url");
params.delete("s");
// 此时的查询字符串是：''
```

- URLSearchParams.forEach(callback)：遍历查询对象，callback 接受每项的值键作为入参，例如：

```js
const searchParams = new URLSearchParams("s=url&from=zxx");
// 输出值和键的内容
searchParams.forEach(function (value, key) {
	console.log(value, key);
});
```

- URLSearchParams.get(name)：返回指定查询参数值，如果无则返回 null，例如：

```js
const params = new URLSearchParams("s=url&from=zxx");
params.get("s");
// 返回：'url'
```

- URLSearchParams.getAll(name)：数组形式返回该查询参数的全部值（查询参数可重复），例如：

```js
const params = new URLSearchParams(
	"s=url&s=urlsearchparams&from=zxx"
);
params.getAll("s");
// 返回：['url', 'urlsearchparams']
```

- URLSearchParams.has(name)：是否包含某个查询参数，例如：

```js
const params = new URLSearchParams("?s=url");
params.has("s") == true; // true
```

- URLSearchParams.keys()：返回含所有查询参数的迭代器，例如：

```js
const searchParams = new URLSearchParams("s=url&from=zxx");
// 显示所有的键
for (const key of searchParams.keys()) {
	console.log(key);
}
```

- URLSearchParams.values()：返回含所有查询参数值的迭代器，例如：

```js
const searchParams = new URLSearchParams("s=url&from=zxx");
// 显示所有的值
for (const value of searchParams.values()) {
	console.log(value);
}
```

- URLSearchParams.entries()：返回查询参数的迭代器对象，以此获得所有键值对，例如使用`for..of`：

```js
const searchParams = new URLSearchParams("s=url&from=zxx");
// 显示所有的键值对
for (const pair of searchParams.entries()) {
	console.log(pair[0] + ", " + pair[1]);
}
```

- URLSearchParams.set(name, value)：设置指定查询参数值，若无则直接添加，例如：

```js
const params = new URLSearchParams(
	"s=url&s=urlsearchparams&from=zxx"
);
params.set("s", "css世界");
params.getAll("s"); // 返回值是：['css世界']
```

```js
const params = new URLSearchParams("s=url");
params.set("from", "zxx");
params.toString(); // 结果是：'s=url&from=zxx'
```

- URLSearchParams.sort()：将所有查询参数键/值对根据键的 Unicode 排序，返回 undefined，例如：

```js
const searchParams = new URLSearchParams("c=4&a=2&b=3&a=1");
// 键值对排序
searchParams.sort();
// 显示排序后的查询字符串
console.log(searchParams.toString()); // 结果是：a=2&a=1&b=3&c=4
```

- URLSearchParams.toString()：返回查询对象对应的字符串，上文中出现多次，这里不重复展示

## URL 实例对象的属性和方法

假设有 URL 地址如下：

```js
const url = new URL(
	"https://www.zhangxinxu.com:80/wordpress/?s=url#comments"
);
const ftp = new URL("ftp://username:password@192.168.1.1/path/file");
```

### 属性

- hash：锚链值，包含字符串'#'。这里 `url.hash` 的返回值是 `'#comments'`
- host：host 主机地址，包括协议端口号，这里 `url.host` 的返回值是 `'www.zhangxinxu.com:80'`
- hostname：主机名称，不包括端口号，这里 `url.hostname` 的返回值是 `'www.zhangxinxu.com'`
- href：完整 URL 地址
- origin：源（只读），包含 URL 协议、域名和端口，这里 `url.origin` 的返回值是 `'https://www.zhangxinxu.com:80'`
- password：地址前的密码，ftp 协议中较常见，这里 `ftp.password` 的返回值是 `'password'`
- username：地址前的用户名，ftp 协议中比较常见。这里 `ftp.username` 的返回值是`'username'`
- pathname：目录+文件名，这里 `ftp.pathname` 的返回值是 `'/path/file'`
- port：端口号，这里 `url.port` 的返回值是 `'80'`，`ftp.port` 的返回值是 `''`
- protocol：协议，包括后面的冒号':'， 例如这里 `url.protocol` 的返回值是 `'https:'`，`ftp.protocol` 的返回值是 `'ftp:'`
- search：查询字符串，若有参数则返回值以问号'?'开头，这里 `url.search` 的返回值是 `'?s=url'`
- searchParams：返回一个 URLSearchParams 对象，可调用其上方法以对查询字符串进行处理。例如想知道查询参数 s 对应的值，可以：`url.searchParams.get('s');`

### 方法

- toString()：返回完整 URL 地址，可理解为 URL.href 的只读形式
- toJSON()：同样返回完整 URL 地址，返回的字符串和 href 属性一样

### 静态方法

- URL.createObjectURL(object)：可为 File、Blob 或 MediaSource 对象创建唯一的 blob URL
- URL.revokeObjectURL(objectURL)：撤消之前使用 URL.createObjectURL() 创建的 URL

使用案例
使用 Ajax 请求跨域图片以避免 canvas 跨域问题：

```js
const xhr = new XMLHttpRequest();
xhr.onload = function () {
	const url = URL.createObjectURL(this.response);
	const img = new Image();
	img.onload = function () {
		// 此时就可使用 canvas 对 img 为所欲为了
		// ...
		// 图片用完后记得释放内存
		URL.revokeObjectURL(url);
	};
	img.src = url;
};
xhr.open("GET", url, true);
xhr.responseType = "blob";
xhr.send();
```
