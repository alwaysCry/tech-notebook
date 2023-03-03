# 面试题解析之编程

## 求两个日期间的有效日期

如 2015-2-8 到 2015-3-3，返回 `[2015-2-8, 2015-2-9]`

```js
function rangeDays(start, end) {
	start = +new Date(start);
	end = +new Date(end);
	const dayTimes = 24 * 60 * 60 * 1000;
	const days = [];

	while (start <= end) {
		days.push(new Date(start).toLocaleDateString().replace(/\//g, "-"));
		start += dayTimes;
	}

	return days;
}
```

## 将特定字符串转化为结构化对象

如：`'abc' => {value: 'abc'}`，`'[abc[bcd[def]]]' => {value: 'abc', children: {value: 'bcd', children: {value: 'def'}}}`

字符串仅由小写字母和 `[]` 组成，不包含空格

```js
function normalize(str) {
	const result = {};
	return str
		.split(/[\[\]]/g)
		.filter(Boolean)
		.reduce((acc, item, index, arr) => {
			acc.value = item;
			if (index < arr.length - 1) {
				acc.children = {};
				return acc.children;
			}
			return result;
		}, result);
}
```

## 数字的每 3 位以点分隔

如：`'10000000000' => '10.000.000.000'`

```js
//  德国以 . 分割金钱, 使用德国当地格式化方案
(10000000000).toLocaleString("de-DE");

// 匹配后接3的整数倍个0的字符间隙，添加 .
"10000000000".replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// 寻找数字并在其后添加 .
"10000000000".replace(/(\d)(?=(\d{3})+\b)/g, "$1.");
```

## 实现一个 Dialog 类，可创建 dialog 对话框，支持拖拽

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>dialog</title>
		<style>
			body {
				height: 100vh;
			}
			.dlg-wrapper {
				background-color: rgba(0, 0, 0, 0.8);
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				z-index: 1;
			}
			.x-dialog {
				position: absolute;
				z-index: 2;
				background-color: #fff;
				left: 50%;
				top: 50%;
				width: 200px;
				text-align: center;
				border-radius: 8px;
				border: 1px solid #000;
				padding: 16px;
				user-select: none;
			}
			.x-dialog header {
				font-weight: bolder;
			}
			.x-dialog footer {
				display: flex;
				justify-content: space-around;
			}
		</style>
	</head>
	<body></body>
	<script>
		class Dialog {
			constructor(opts = {}) {
				this.onCancel = opts.onCancel || (() => {});
				this.onOk = opts.onOk || (() => {});
				this.title = opts.title || "please enter title";
				this.body = opts.body || "please enter body";
				this.footer = opts.footer || [{ title: "cancel" }, { title: "ok" }];
				this.wrapper();
				this.init();
				this.drag();
				this.wrap.appendChild(this.dom);
			}

			init() {
				const dom = document.createElement("aside");
				dom.className = "x-dialog";
				dom.innerHTML = `
					<header>${this.title}</header>
		    	<section>${this.body}</section>
				`;
				this.dom = dom;
				// TODO：待商榷，既然 _dom 的目的是封装 this.dom 操作，则后面就不该直接对 this.dom 赋值
				Object.defineProperty(this, "_dom", {
					get() {
						return this.dom;
					},
					set(val) {
						val
							? val.appendChild(this.wrap)
							: this.wrap.parentNode &&
							  this.wrap.parentNode.removeChildren(this.wrap);
					},
				});
				this.renderFooter();
			}

			open(mountNode = document.body) {
				this._dom = mountNode;
			}

			close() {
				this._dom = null;
			}

			wrapper() {
				const wrap = document.createElement("div");
				wrap.className = "dlg-wrapper";
				this.wrap = wrap;
			}

			renderFooter() {
				if (!this.footer) return;
				const footer = document.createElement("footer");
				const btns = this.footer.map(({ title = "unknown" }, index) => {
					const btn = document.createElement("button");
					btn.dataset.midIndex = index;
					btn.innerText = title;
					footer.appendChild(btn);
					return btn;
				});

				footer.addEventListener("click", (e) => {
					const currentIndex = e.target.dataset.midIndex;
					const { cb } = this.this.footer[currentIndex];
					if (cb) cb.call(btns[currentIndex], e);
					// TODO: 待商榷，是否按下任意按钮都需退出
					this.close();
				});
				this.dom.appendChild(footer);
			}

			drag() {
				let diffX = 0;
				let diffY = 0;
				const handleDrag = (e) => {
					const { x, y } = this.dom.getBoundingClientRect();
					this.dom.style.left = `${x + e.clientX - diffX}px`;
					this.dom.style.top = `${y + e.clientY - diffY}px`;
					diffX = e.clientX;
					diffY = e.clientY;
				};
				document.addEventListener("mousedown", (e) => {
					if (!e.path.includes(this.dom)) {
						e.preventDefault();
						return;
					}
					const { x, y } = this.dom.getBoundingClientRect();
					diffX = e.clientX;
					diffY = e.clientY;
					document.addEventListener("mousemove", handleDrag);
				});
				document.addEventListener("mouseup", (e) => {
					diffX = 0;
					diffY = 0;
					document.removeEventListener("mousemove", handleDrag);
				});
			}
		}
		const instance = new Dialog();
		instance.open();
	</script>
</html>
```
