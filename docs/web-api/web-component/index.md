# Web Component

自定义元素（Custom elements）以类型声明方式定义，又可细分为：

- Autonomous：继承自 HTMLElement 抽象类

- Customized built-in：继承自内建 HTML 元素类，以复用前者的功能、语义、样式等

可包含以下特殊方法/属性（以 Autonomous 元素为例）：

```js
class MyElement extends HTMLElement {
	// 创建元素实例
	constructor() {
		super();
	}

	// 元素每次被添加到文档后被调用
	connectedCallback() {}

	// /元素每次从文档移除后被调用
	disconnectedCallback() {}

	static get observedAttributes() {
		return [
			/* 将需要监听值变化的 attribute 名列于此处 */
		];
	}

	// 上述 attribute 值变化后被调用
	attributeChangedCallback(name, oldValue, newValue) {}

	// 在元素被移动到新文档后被调用（如document.adoptNode）
	adoptedCallback() {}
}
```

定义完后还需**注册**以将类与对应 HTML 标签相关联，例如：

```js
// Autonomous 元素
customElements.define("my-element", MyElement);

// Customized built-in 元素，注意须提供第三个参数
customElements.define("hello-button", HelloButton, { extends: "button" });
```

之后每当对应标签元素被**创建**，都将实例化该类。例如：

```html
<!-- 
  Autonomous 元素
  document.createElement("my-element") 同理 
-->
<my-element></my-element>

<!-- 
  Customized built-in 元素 
  注意其通过 is 特性指定父类，标签名不变
-->
<button is="hello-button">Click</button>
```

要点：

- 自定义元素标签名必须包含`-`，以避免与内建 HTML 元素的命名冲突

- 若自定义元素标签在**注册前**即被浏览器解析，则将被当作未知元素（如同任何非标准标签），并不会报错。其`connectedCallback`将在注册后被调用

- 上述未注册元素可被 CSS 选择器`:not(:defined)`匹配，而注册后则匹配`:defined`

- `customElements.get(name)` 方法根据类名返回相应的自定义元素类

- `customElements.whenDefined(name)` 方法根据类名返回 Promise 对象，其将在前者被注册时 resolve

- 自定义元素被实例化时尚未被插入文档，其 attribute 也未被浏览器处理（调用`getAttribute`方法将返回`null`），因而不要在`constructor`中创建元素内容，而应该在`connectedCallback`中

- HTML 解析器构建 DOM 时，会按先父后子的顺序。自定义元素同理，即无法在`connectedCallback`中访问其`innerHTML`（假设其存在子元素）

<!-- TODO：待补完 -->
