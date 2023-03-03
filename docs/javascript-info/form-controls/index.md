# 表单控件概述

## 表单属性和方法

表单（form）及其控件元素（controls）具有许多特殊属性和事件

### 表单和控件的导航

页面中的所有表单都被包含在**命名的集合** `document.forms` 中，可通过其 name 或序号来获取：

同样，表单中的任何控件元素（无论层级）也被包含在命名集合 `form.elements`中。且当有控件 name 相同时，`form.elements[name]` 将会是一个集合

表单中的 `<fieldset>` 元素也具有 elements 属性，可视为 “子表单”

:::tip
还可通过更简短的 `form[index/name]` 来访问元素（即可将 `form.elements.login` 写成 `form.login`），但不推荐
:::

```html
<form name="my">
	<input name="one" value="1" />

	<input type="radio" name="age" value="10" />
	<input type="radio" name="age" value="20" />

	<fieldset name="userFields">
		<legend>info</legend>
		<input name="login" type="text" />
	</fieldset>
</form>

<script>
	const form = document.forms.my; // 或 document.forms[0]

	const one = form.elements.one; // <input name="one"> 元素
	const ages = form.elements.age; // RadioNodeList(2) [input, input]

	const fieldset = form.elements.userFields; // HTMLFieldSetElement
	fieldset.elements.login === form.elements.login; // true
</script>
```

### 反向引用

任何控件元素都可通过 element.form 访问其所在表单 —— 表单引用了所有控件，控件也引用了表单。示意如下：

![](./assets/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202022-09-23%20111446.png)

### 表单元素

下面来看具体控件

#### input 和 textarea

除单选框（radio）通过 checked 属性获取布尔类型值外，其余 input 系列包括复选框（checkbox），和 textarea 均通过 value 属性获取字符串类型值

### select 和 option

select 元素有 3 个重要属性：

- options：option 子元素集合
- value：当前所选 option 子元素的 value
- selectedIndex：当前所选 option 的序号

这也提供了三种为 select 设置值的方式：

1. 找到对应 option 元素（可通过 select.options），并将其 selected 属性设为 true
2. 将 select 的 value 属性设为对应的值
3. 将 select 的 selectedIndex 属性设为对应 option 元素的序号

此外，select 在具有 multiple 特性（attribute）时允许多选，此时只能使用上述第一种方式设置值

## 聚焦

当用户点击控件元素或使用 Tab 键选中时，该元素即被聚焦（focus），通常意味着“准备在此处接受数据”。另有 autofocus 特性可在网页加载时默认聚焦某一元素

而失去焦点的时刻（blur）可能发生在用户点击页面的其它地方，或按下 Tab 键聚焦到下一控件元素，通常意味着“数据已输入完成”

### focus/blur 事件

元素聚焦时会触发 focus 事件；失焦时会触发 blur 事件

focus / blur 事件不会向上冒泡，例如不能把 onfocus 放在 `<form>` 上来对其进行高亮，这里有两个解决方案：

1. 方案一：focus/blur 虽不会向上冒泡，但会在捕获阶段向下传播，于是以下代码可生效：

```html
<form id="form">
	<input type="text" name="name" value="Name" />
	<input type="text" name="surname" value="Surname" />
</form>

<style>
	.focused {
		outline: 1px solid red;
	}
</style>

<script>
	form.addEventListener("focus", () => form.classList.add("focused"), true);
	form.addEventListener("blur", () => form.classList.remove("focused"), true);
</script>
```

2. 方案二：使用 focusin/focusout 事件 —— 与 focus/blur 事件完全一样且会冒泡。注意必须使用 elem.addEventListener ，而不能是 `on<event>`

### focus/blur 方法

可使用`elem.focus()` 和 `elem.blur()` 方法使控件元素聚焦/失焦

如以下实例，当输入值无效时，焦点无法离开该 input 元素（在 onblur 回调中重新聚焦了自身）：

<Refocus />

**注意：** 无法在 onblur 事件回调中通过 `event.preventDefault()` 来阻止失焦，因为该事件是在元素失焦后触发的

:::warning
有很多种原因可导致失焦，比如用户点击了其它位置。然而 JavaScript 自身也可能导致失焦，例如：

- alert 会将焦点移至自身，因此导致元素失焦（触发 blur），而当 alert 对话框被取消时，焦点又重新回到原元素上（触发 focus）
- 元素被移除也会导致失焦，且即使稍后被重新插入到 DOM，焦点也不会重回

以上特性有时会导致 focus/blur 处理程序发生异常 —— 在不需要时触发
:::

### 在任何元素上聚焦

很多元素默认不支持聚焦，比如 div、span 和 table 等元素：不支持 focus 方法，也不会触发 focus/blur 事件

使用 tabindex 特性可改变这种情况，任何具有该特性的元素都会变成可聚焦的，而特性值是当使用 Tab 在元素间切换时的顺序

具体顺序为：具有 tabindex 的元素排在前面（按其值顺序），然后是不具有 tabindex 的控件元素（例如常规的 input 元素）（按文档源顺序）。这里有两个特殊值：

- tabindex="0" 会使该元素被与不具有 tabindex 的元素放在一起。即当切换元素时，其会排在 tabindex ≥ 1 元素的后面。通常用于使元素具有焦点，但是保留默认切换顺序

- tabindex="-1" 只允许以编程方式(`elem.focus()`)聚焦此元素，而 Tab 键会忽略

:::tip
可使用 elem.tabIndex 来添加 tabindex，效果是一样的
:::

最后，可通过 `document.activeElement` 来获取当前所聚焦元素

## change、input、cut、copy、paste 事件

### change 事件

change 事件表示元素更改完成

- 对于 text input，会在其失焦时触发
- 而对于 checkbox/radio input、select，则会在选项更改后触发

### input 事件

对输入值进行修改后会触发 input 事件

与键盘事件不同，该事件只要值改变就能触发，例如：使用鼠标粘贴、或使用语音识别来输入文本；另一方面，不涉及值更改的键盘输入也不会触发该事件，例如在输入时按方向键 ⇦ ⇨

若要处理对 `<input>` 的每次更改，此事件是最佳选择

:::tip
当输入值更改后，才会触发 input 事件，这也意味着 `event.preventDefault()` 在其回调中无效
:::

### cut、copy、paste 事件

这些事件发生于剪切/拷贝/粘贴一个值时，属于 ClipboardEvent 类，并提供了对相关数据的访问方法。可使用 event.preventDefault() 来中止行为

例如以下代码阻止了剪切、拷贝、粘贴动作，并 alert 出了相关内容：

```html
<input type="text" id="input" />

<script>
	input.onpaste = function (event) {
		alert(`paste: ${event.clipboardData.getData("text/plain")}`);
		event.preventDefault();
	};

	input.oncut = input.oncopy = function (event) {
		alert(`${event.type} - ${document.getSelection()}`);
		event.preventDefault();
	};
</script>
```

注意点：

- 在剪切/复制事件回调中调用 event.clipboardData.getData(...) 只会得到空字符串：此时数据还未存入剪切板，使用 event.preventDefault() 能中止复制/剪切

- 使用 document.getSelection() 来得到被选中的文本

- 除文本外，还可复制/粘贴其他各种内容，例如在 os 文件管理器中复制一个文件并进行粘贴。这是因为 clipboardData 实现了 DataTransfer 接口（常用于拖放和复制/粘贴），可在 [DataTransfer 规范](https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface) 中详细了解

- 还有一个可访问剪切板的异步 API：navigator.clipboard，详见 [Clipboard API 和事件规范](https://www.w3.org/TR/clipboard-apis/)，Firefox 暂未支持

### 安全限制

剪贴板是操作系统级别的东西，用户可能会在各应用程序间切换，复制/粘贴不同内容，而浏览器不应能访问这些。因此大多数浏览器仅允许在某些操作范围内（例如复制/粘贴等）对剪切板做无缝的读/写访问

除 Firefox 外，所有浏览器都禁止使用 dispatchEvent 生成自定义剪贴板事件，即使我们设法调度此类事件。规范也明确声明了，合成（syntetic）事件不得提供对剪切板的访问权限

此外，无法在事件回调中保存 event.clipboardData，再稍后访问，其仅在用户启动的事件回调上下文中生效；而 navigator.clipboard 是一个较新的 API，适用于任何上下文，若需要会请求用户的许可。

## 表单提交事件和方法

提交表单会触发 submit 事件，常用于发送前对其进行校验或中止提交；form.submit() 方法允许从 JS 中提交表单

### submit 事件

提交表单主要有两种方式：

1. 点击 `<input type="submit">` 或 `<input type="image">`
2. 在控件元素被聚焦时按下 Enter

二者都会触发表单的 submit 事件，可在回调中使用 event.preventDefault() 中止提交

:::tip
通过按下 Enter 发送表单时，会在 `<input type="submit">` 上（若存在该元素）触发一次 click 事件
:::

### submit 方法

若要手动提交表单，可调用 form.submit()，这样就不会产生 submit 事件
