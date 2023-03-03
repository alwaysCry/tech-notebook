# 鼠标事件概述

:::tip 提示
鼠标事件还可能来自模拟此类操作的设备，如手机和平板
:::

## 事件类型

- **mousedown/mouseup**：在元素上点击/释放鼠标按键（不分左右键）
- **mouseover/mouseout**：指针从一个元素上移入/移出
- **mousemove**：指针在元素上的移动
- **click**：左键在同一元素上相继触发 mousedown 和 mouseup 后
- **dblclick**：短时间内双击同一元素
- **contextmenu**：右键在同一元素上相继触发 mousedown 和 mouseup，或其他打开上下文菜单的方式（如使用特殊的键盘按键）  
  ...

## 事件顺序

一个用户操作可能会触发多个事件。例如点击鼠标左键，在按下左键时先触发 mousedown，释放时再触发 mouseup 和 click

单个动作触发多个事件的顺序是固定的

## 鼠标按键

鼠标点击相关事件对象具有 button 属性，可获取确切的鼠标按键

通常无需在 click 和 contextmenu 中使用，前者与后者分别只在单击左/右键时触发

但在 mousedown 和 mouseup 中可能会有需要，此二者在任何按键上都会触发，可通过其区分是左键还是右键

`event.button` 所有可能值如下：

| 鼠标按键状态    | `event.button` |
| --------------- | -------------- |
| 左键 (主要按键) | 0              |
| 中键 (辅助按键) | 1              |
| 右键 (次要按键) | 2              |
| X1 (后退按键)   | 3              |
| X2 (前进按键)   | 4              |

此外还有 `event.buttons` 属性，以整数形式存储当前所有按下的鼠标键，每个按键一个比特位。实际开发中很少用到，若有需要可在 [MDN](https://developer.mozilla.org/zh/docs/Web/api/MouseEvent/buttons) 中找到更多细节

:::tip 过时的 event.which
一些老代码会使用 `event.which` 获取按下鼠标键，可能为如下值：

- 1 —— 左键
- 2 —— 中键
- 3 —— 右键

这是古老而非标准方式，现已不建议使用
:::

## 组合键

所有鼠标事件都包含键盘组合键信息，事件属性如下（事件期间按下相应键则属性值为 true）：

- shiftKey：Shift 键
- altKey：Alt 键（ Mac 上为 Opt 键）
- ctrlKey：Ctrl 键
- metaKey： Win 键（Mac 上为 Cmd 键）

如仅在 Alt+Shift+Click 时才有效的点击：

```html
<button id="button">Alt+Shift+Click</button>
<script>
	button.onclick = function (event) {
		if (!event.altKey || !event.shiftKey) {
			return false;
		}
		// ...
	};
</script>
```

:::tip 在 Mac 上通常用 Cmd 代替 Ctrl
Mac 的 Cmd 键虽对应 metaKey 属性，但多数情况下相当于 Windows/Linux 上的 Ctrl 键。即 Mac 上 Ctrl+click 的对应操作为 Cmd+click，因为前者会被解释为右键单击，并生成 contextmenu 事件

因此，若想适配所有操作系统，则应将 ctrlKey 与 metaKey 一起检查，即：

```js
if (event.ctrlKey || event.metaKey) {
	// ...
}
```

:::

## 坐标

所有鼠标事件都提供两种形式坐标(详见[此文](/javascript-info/coordinate))：

- 相对于窗口的 clientX/clientY
- 相对于文档的 pageX/pageY

## 防止在鼠标按下时选择文本

涉及文本选择的鼠标操作：

- 双击
- 按下左键不松开，并移动

要避免不必要的选择，最合理方式是从 mousedown 入手，例如：

@[code{2-6} html](./PreventSelection.vue)

<PreventSelection />

此时，在粗体文本上的鼠标操作均不会使其被选中，除非从其前后文本上开始

:::tip 防止复制
若想防止页面内容被选中复制，可从 copy 事件中入手，例如：

```html
<div oncopy="alert('禁止复制！');return false">该段内容无法被复制</div>
```

当然用户仍可访问页面源码，并从中获取内容
:::
