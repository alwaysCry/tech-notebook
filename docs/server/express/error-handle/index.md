# 错误捕获和处理

## 错误捕获

在 Express 中间件/handler 中：

- 同步代码错误：可被自动捕获
- 异步代码错误：**必须**调用 next 回调并传入 Error 对象，否则无法被捕获

例如在 Promise 中可这样处理：

```js
app.get("/", (req, res, next) => {
	Promise.resolve()
		.then(() => {
			throw new Error("BROKEN");
		})
		.catch(next);
});
```

而在异步回调中可考虑将同步执行代码拆分出去：

```js
app.get("/", [
	function (req, res, next) {
		fs.readFile("/maybe-valid-file", "utf-8", (err, data) => {
			res.locals.data = data;
			next(err);
		});
	},
	// 此处无需专门捕获错误并交给 next
	function (req, res) {
		res.locals.data = res.locals.data.split(",")[1];
		res.send(res.locals.data);
	},
]);
```

（自 **Express5** 起， 中间件/handler 返回的 Promise 对象在 rejected 时会自动调用 `next(err)`）

且若向 next 回调传入任何 `'route'` 以外的非 undefined 值，都会被视为出现错误并跳过余下所有非错误处理 handler 和中间件

## 错误处理

### 默认的错误处理程序

Express 有内建的默认错误处理程序，位于所有中间件/handler 的末尾，其将所有未处理的错误连同堆栈信息（开发环境下）回写给客户端：

- 将`err.status`（或`err.statusCode`）的值写入到`res.statusCode`，若前者超出 4xx 和 5xx 范围，则为 500
- 根据`res.statusCode`来设置`res.statusMessage`
- 开发环境下以`err.stack`作为响应体，生产环境下则为状态码
- 将`err.headers`内容写入到响应头中

若在开始写入响应时调用 `next(err)`（例如在向客户端流式响应时出现错误），默认错误处理程序会关闭该连接并使请求失败。所以当响应头已被发送时，自定义错误处理程序需要将控制权转到默认的上面。如：

```js
function errorHandler(err, req, res, next) {
	if (res.headersSent) {
		// 根据头信息是否已发送来区分
		return next(err);
	}
	res.status(500);
	res.render("error", { error: err });
}
```

:::tip 提示
将环境变量 NODE_ENV 设为 production，即可以生产模式运行 Node App
:::

### 自定义错误处理程序

错误处理中间件在最后被注册，并接受 4 个入参：err、req、res、next，可注册任意多个。但注意，要么在当前中间件中写入或结束该响应，要么通过 `next(err)` 调用下一个错误处理中间件（直到最后的 “catch-all”），否则请求将被挂起，且垃圾处理无法回收
