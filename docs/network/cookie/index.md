# cookie 总结

cookie 是 HTTP 协议的一部分，是存储于浏览器中的一小串数据，可通过以下方式设置：

- 在服务端通过响应头 `Set-Cookie`
- 在浏览器端通过 `document.cookie`

浏览器使用 `Cookie` 头将其附加到（几乎所有）同域请求中；跨域（源）请求通常需在请求方法中额外设置 withCredentials 或 credentials；跨站请求则有更进一步限制（参见下文 samesite 部分）

## 读取 cookie

浏览器中可通过 `document.cookie` 得到当前域下的所有 cookie，(**不包含每个 cookie 的选项**) 以键值对组成，按`;`分隔，每一个都是独立的 cookie

**注意区分 cookie 及其选项**（如 path、domain、expires 等，被列在 key=value 之后，同样以 ; 分隔），每个 cookie 都有自己的选项

## 设置 cookie

也可向 `document.cookie` 赋值, 注意这是一个访问器（getter/setter）而非数据属性，赋值操作会被特殊处理：**向 `document.cookie` 赋值只会更新右值中涉及的 cookie**

cookie 的 key 和 value 可为任意字符，但为保证有效格式，应使用内建的 encodeURIComponent 函数对其进行转义

**最好一次设置一个 cookie**（即除跟随的选项外，只包含一个 key=value 对），以免产生歧义

## 删除 cookie

**cookie 到期后会被浏览器自动删除**，因此删除 cookie 有以下方式：

- 将其 expires 选项设为过去的时间
- 将其 max-age 选项设为 0 或负数

<!-- **注意：当更新或删除一个 cookie 时，应该使用同设置该 cookie 时相同的 path 和 domain 选项** -->

## cookie 的选项

### path

须为绝对路径，此路径下的页面可访问该 cookie。**默认为当前路径**，即 `path=/admin` 的 cookie 在 /admin 与 /admin/something 下可见，而在 /home 或 /adminpage 下不可见

常设为根目录`path=/`，此 cookie 全站可见

### domain

可访问该 cookie 的域，默认为当前域（不含子域）

例如 site.com 的 cookie 在其子域 forum.site.com 下不可见，可将其设为根域来改变：若`domain=site.com`，则其可被任意子域 \*.site.com 访问

### expires/max-age

用于设置 cookie 的过期时间。默认下（即此二者均未被设置）cookie 会在浏览器关闭后消失，此类 cookie 也被称为 "session cookie"

- expires 选项指定 cookie 的到期日期，只限 GMT 时区格式（可使用`date.toUTCString`获取），将其设为过去的时间会删除该 cookie
- max-age 指定 cookie 在指定**秒数**后过期，设为 0 或负数会删除该 cookie

### secure

指定该 cookie 只能通过 HTTPS 传输。cookie 默认基于域而不区分协议，例如 http://site.com 的 cookie 也会出现在 https://site.com 上，反之亦然

### samesite

用于防止 XSRF（跨网站请求伪造）攻击

- 若 `samesite=strict` 或仅显式设置 samesite，则 cookie 不会附加于任何**跨站**请求中，即使请求方法中设置了 `withCredentials=true`(XMLHttpRequest)或`credentials: "include"`(Fetch)
- 若 `samesite=lax` （chrome76 起默认），跨站限制会在以下条件同时满足时解除：
  - HTTP 方法是”安全的“（即用于读取而非写入，如 GET 而非 POST）
  - 该操作执行顶级导航（即更改浏览器地址栏中的 URL）：注意在\<iframe\>中执行导航是非顶级的；另外用于网络请求的 JavaScript 方法不会执行任何导航
- 若 `samesite=none` ，则该 cookie 可在跨站请求中附加，前提是其包含 `secure` 选项（自 chrome80 起）

### httpOnly

用于禁止 JavaScript 访问该 cookie（无法通过 `document.cookie` 获取，也无法对其操作），该选项只可在服务端通过 `Set-Cookie` 头设置

## 附: 操作 cookie 的函数

### getCookie(name)

获取 cookie 最简短的方式是使用正则表达式，以下函数根据 name 返回 cookie 值

```js
function getCookie(name) {
	let matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" + // 非捕获组，匹配行开头或分号后跟一空格
				// 将name中的所有特殊字符前加上\\, 如 \\ => \\\\
				name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
				"=([^;]*)" // 匹配等号后跟一捕获组，捕获任意多个非分号字符
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}
```

### setCookie(name, value, options)

```js
function setCookie(name, value, options = {}) {
	options = {
		path: "/",
		// 如果需要，可以在这里添加其他默认值
		...options,
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie =
		encodeURIComponent(name) + "=" + encodeURIComponent(value);

	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

// 使用范例：
setCookie("user", "John", { secure: true, "max-age": 3600 });
```

### deleteCookie(name)

设置一个负的过期时间来删除 cookie

```js
function deleteCookie(name) {
	setCookie(name, "", {
		"max-age": -1,
	});
}
```
