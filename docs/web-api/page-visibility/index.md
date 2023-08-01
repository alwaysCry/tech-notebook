# 页面可见性 API

[原文](https://wangdoc.com/webapi/page-visibility)

该系列 API 基本可覆盖先前需要监听`pagehide`、`beforeunload`、`unload`这三个事件的场景。尤其在移动端，浏览器进程可能先被切换至后台，再被杀死，此时仅凭前述事件将无法响应

当页面变为不可见时，诸如以下行为都是可以暂停的：

- 对服务器的轮询

- 动画

- 正在播放的音视频

## document.visibilityState

只读属性，表示页面当前可见状态，可能值：

- `hidden`：完全不可见

- `visible`：至少一部分可见

- `prerender`：即将或正在渲染，暂不可见。仅在 Chrome 等支持预渲染的浏览器上出现

注意`<iframe>`内嵌页的`document.visibilityState`由其顶层窗口决定，即使用 CSS 将`<iframe>`隐藏（如`display: none;`）也不影响其可见性

## document.hidden

只读属性，返回布尔值表示当前页面被隐藏。当前仅出于历史原因而保留，尽量还是使用 `document.visibilityState`

## visibilitychange 事件

该事件在`document.visibilityState`变化后触发
