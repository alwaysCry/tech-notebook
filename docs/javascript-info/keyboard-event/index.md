# 键盘事件概述

:::tip 注意
现代设备有其他输入内容的方法，如语音识别或鼠标复制/粘贴

因此通过键盘事件来跟踪 `<input>` 输入并不可靠，建议通过 input 事件（参见[此文](https://zh.javascript.info/events-change-input)）

:::

## 事件

- 按下按键会触发 keydown 事件
- 释放按键会触发 keyup 事件

唯一例外是笔记本上的 Fn，不会触发事件

### event.code VS event.key

事件对象的 key 属性获取按键字符；code 属性获取**按键代码**（大小写敏感）

- 大小写字母的 `event.key` 不同而 `event.code` 相同，例如：

  | Key       | `event.key` | `event.code` |
  | --------- | ----------- | ------------ |
  | Z         | z（小写）   | KeyZ         |
  | Shift + Z | Z（大写）   | KeyZ         |

- 若使用其他字母语言，则 `event.key` 变为不同的字母值，而 `event.code` 则始终相同

- 无对应字符的按键，其 `event.key` 与 `event.code` 大致相同，例如：
  | Key | `event.key` | `event.code` |
  | --------- | ----------- | ------------ |
  | Backspace | Backspace | Backspace |
  | Shift | Shift | ShiftRight 或 ShiftLeft |

- `event.code` 准确标明了哪个键被按下,例如左右 Shift，参见上例

:::tip 按键代码 (event.code)
按键代码取决于该键在键盘上的位置，[UI 事件代码规范](https://www.w3.org/TR/uievents-code/) 中描述了几种广泛应用键盘布局的按键代码。例如

- 字符键代码为 `Key<letter>`，如 `KeyA`，`KeyB` 等
- 数字键代码为：`Digit<number>`，如 `Digit0`，`Digit1` 等
- 特殊按键代码为其名称，如 `Enter`，`Backspace`，`Tab` 等

更多可请参见[规范的字母数字部分](https://www.w3.org/TR/uievents-code/#key-alphanumeric-section)
:::

### 实例：监听 Ctrl+Z（Cmd+Z）

Ctrl+Z（Mac 中 Cmd+Z）在大多数文本编辑器中表示“撤销”，为监听此热键，在监听器中应该检查 `event.key` 还是 `event.code` ？

解答：`event.key` 的值为字符，随语言而改变，相同按键可能给出不同字符。因此检查 `event.code` 更好，它总是相同的，像这样：

```js
document.addEventListener('keydown', function(event) => {
  if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
    // ...
  }
})
```

但 `event.code` 也有问题，即不同键盘布局导致的不同。例如美式布局的“Z”对应于德式布局的“Y”，[规范](https://www.w3.org/TR/uievents-code/#table-key-code-alphanumeric-writing-system)中有明确提及。当然此情况仅发生在 keyA、keyQ、keyZ 等几个按键上，诸如 Shift 等特殊按键并无此情况，也可在[规范](https://www.w3.org/TR/uievents-code/#table-key-code-alphanumeric-writing-system)中找到该列表

因此若涉及到与布局有关的按键，`event.key` 可能更好

## 自动重复

若长按一个键，其会开始自动重复：keydown 会反复触发，直到按键释放时最终得到 keyup。因此有多个 keydown 而只有一个 keyup 是正常的

自动重复触发的事件，其 event 对象的 repeat 属性为 true

## 默认行为

键盘可能触发很多东西，因而默认行为各不相同。例如：

- 出现在屏幕上的一个字符（最常见）
- 一个字符被删除（Delete 键）
- 滚动页面（PageDown 键）
- 浏览器打开“保存页面”对话框（Ctrl+S）
  …

阻止 keydown 默认行为可以取消上述大多数，但基于 OS 行为除外，例如 Windows 中 Alt+F4 关闭当前窗口

### 实例：输入电话号码

以下 `<input>` 期望输入电话号码，因此只接受除数字、+、(、) 、- 以及 Left、Right、Delete 和 Backspace 按键

@[code{1-23} vue](./CheckPhoneKey.vue)

<CheckPhoneKey />

注意仍可通过右键单击 + 粘贴输入不合法内容，移动端也提供了类似方式，因此该过滤并非 100% 可靠。更合理的方式是借助 input 事件
