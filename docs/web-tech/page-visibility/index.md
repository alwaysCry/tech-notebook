# 页面可见性综述

相关属性：

- `document.hidden`：只读，布尔值，表示当前页面是否可见
- `document.visibilityState`：只读，当前页面的可见状态，其值可为：hidden、visible

事件：

- `visibilitychange`: 可见状态改变时触发

以上 API 兼容性约为 IE10+，考虑到部分浏览器可能需私有前缀，可使用或参考[此代码](https://www.zhangxinxu.com/study/201211/pageVisibility.js)

## 常见用途

列举一些有价值的应用场景：

- 页面不可见时自动暂停音/视频播放，实例如下：

  <AutoPause />

- 同步新 tab 页的登录状态
- 统计页面的精确在线时长
- 网页聊天时确定用户是否离开
