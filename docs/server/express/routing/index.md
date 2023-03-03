# 路由

通过 `app.METHOD(...)` 注册，具体支持的方法可[参见](http://expressjs.com/en/4x/api.html#app.METHOD)；另有`app.all()`用于注册可匹配任意方法的路由

## 路径

路由路径可为字符串或正则形式：

- 为字符串形式时，字符 ?、+、\*、( 和 ) 将表示为其在正则表达式中的对应含义。即当前者出现时，该字符串将被看作 string patterns；而 - 和 . 仍将按字面意义被解析。例如：

  ```js
  // 匹配路径 /random.text
  app.get("/random.text", (res, req) => {});
  // 匹配路径 /acd 和 /abcd
  app.get("/ab?cd", (res, req) => {});
  // 匹配路径 /abe 和 /abcde
  app.get("ab(cd)?e", (res, req) => {});
  // 匹配路径 /data/$book，注意路 $ 符号需要特殊处理
  app.get("/data/([$])book", (res, req) => {});
  ```

- 为正则表达式时，例如：

  ```js
  // 匹配任意带 a 的路径
  app.get(/a/, (res, req) => {});
  // 匹配路径 /butterfly 和 /dragonfly
  app.get(/.*fly$/, (res, req) => {});
  ```

## 路径参数

路由参数是路由路径中以冒号开头的部分，被视为键；而实际路径中对应的字符将为值，该键值对将出现在 `req.params` 对象中。例如：

```js
// http://localhost:3000/users/34/books/8989 => req.params: {userId: "34", bookId: "8989"}
app.get("/users/:userId/books/:bookId", (req, res) => {});
// 上文提及的符号 - 和 . 可用于分隔路由参数
// http://localhost:3000/flights/LAX-SFO =>  req.params: {"from": "LAX", "to": "SFO"}
app.get("/flights/:from-:to", (req, res) => {});
// http://localhost:3000/plantae/Prunus.persica => req.params: { "genus": "Prunus", "species": "persica" }
app.get("/plantae/:genus.:species", (req, res) => {});
```

另外还可通过正则限制路由参数的具体形式。由于此处正则表达式为字符串形式，因而要注意：

- 要先对元字符前的反斜杠做转义，如用 \\\\d+ 来表示 [1-9]
- \* 在此表示为任意字符（通配符），而非正则中的任意多个

例如：

```js
// http://localhost:3000/user/42 => 42
// http://localhost:3000/user/penn => 404 not found
app.get("user/:userId(\\d+)", (req, res) => {
	res.rend(req.params.userId);
});
```

## handlers

注册路由时可提供多个 handler、handler 数组或二者混合。可通过调用`next('route')`略过当前路由中所有剩余 handlers。例如：

```js
const cb0 = (req, res, next) => {
	console.log("cb0");
	next("route");
};
const cb1 = (req, res, next) => {
	console.log("cb1");
	next();
};
const cb2 = (req, res, next) => {
	console.log("cb2");
	next();
};
const cb3 = (req, res, next) => {
	console.log("cb3");
	next();
};

app.get("/example", [cb0, cb1]);
app.get("/example", [cb2, cb3]);

// localhost:example => cb0 -> cb2 -> cb3
```

:::warning 注意
不要犯先入为主的错误，Express 中间件并不依照洋葱模型执行！`next()`只触发下一个中间件/handler 的执行，而无论后者是否为异步函数，其都**不会**返回 Promise，因而其下方代码不会等后续异步操作完结后再执行
:::

## 响应方法

response 对象（即 handler 的第二个入参）提供如下方法响应客户端并结束本次请求-响应链（request-response cycle）。若无此类方法调用（且 handlers 最终未通过`next()`移出控制权）则请求将被挂起

- `res.download()`
- `res.end()`
- `res.json()`
- `res.jsonp()`
- `res.redirect()`
- `res.render()`
- `res.send()`
- `res.sendFile()`
- `res.sendStatus()`

## 模块化路由

可通过链式操作为同一路径注册响应不同方法的路由，例如：

```js
app
	.route("/book")
	.get((req, res) => {
		res.send("Get a random book");
	})
	.post((req, res) => {
		res.send("Add a book");
	})
	.put((req, res) => {
		res.send("Update the book");
	});
```

还可更进一步通过 `express.Router` 创建模块化、可挂载的路由实例（Router instance）。后者是独立的路由系统，可注册专属中间件，因而常被视为 mini-app，例如：

```js
const express = require("express");

const router = express.Router();
// 注册专属中间件
router.use((req, res, next) => {
	console.log(`Time: ${Date.now()}`);
	next();
});
router.get("/", (req, res) => {
	res.send("Birds home page");
});
router.get("/about", (req, res) => {
	res.send("About birds");
});

const app = express();
app.use("/birds", birds);
```
