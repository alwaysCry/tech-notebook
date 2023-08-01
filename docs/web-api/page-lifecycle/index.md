# 网页生命周期 API

网页生命周期 API（Page Lifecycle API）由 W3C 制定，统一了网页从诞生到卸载的行为模式，并且定义了相关事件

## 兼容性

自 Chrome68 起支持，老式浏览器可使用兼容库[PageLifecycle.js](https://github.com/GoogleChromeLabs/page-lifecycle)

## 生命周期阶段

网页生命周期分为以下六个阶段，每个时刻仅可能处于其中之一

### Active

网页处于可见状态，并拥有焦点

### Passive

仅发生在桌面同时有多个窗口的情况下。网页可见，但无焦点，UI 更新（如动画）仍在执行

### Hidden

用户桌面被其他窗口占据，网页不可见，但尚未冻结。UI 更新不再执行

### Frozen

网页处于 Hidden 阶段过久，即使用户不关闭，也可能被浏览器冻结。或者可见状态页面长时间没有操作，也会进入该阶段

特征为网页不会再被分配 CPU 计算资源，定时器、回调函数、网络请求、DOM 操作都不会执行。若有正在运行的任务执行完毕，则页面可能会被允许周期性复苏一小段时间，短暂变回 Hidden，允许一小部分任务执行

### Discarded

网页长时间处于 Frozen 阶段未被唤醒，或处于 Passive 阶段长时间无操作，则可能进入 Discarded 阶段

浏览器自动卸载网页，清除其内存占用。此时通常处于资源限制状况下，任何新任务或 JavaScript 代码都无法执行

由于其 Tab 窗口仍存在，若用户再次访问，浏览器将重新发送请求并加载该网页，回到 Active 阶段

### Terminated

用户主动关闭窗口或从当前窗口前往其他页面，网页将开始被浏览器卸载并从内存中清除。新任务不再启动，正在进行的任务也可能被终止

该阶段发生在 Hidden 之后，换而言之，用户主动离开当前页时总是先进入 Hidden，再进入 Terminated

## 常见场景

以下为部分场景下的网页生命周期变化：

- 打开网页后，又切换到其他 App，过了一会后又回到网页：Active -> Hidden -> Active

- 打开网页后，又切换到其他 App 并长时间未返回，导致网页被自动丢弃：Active -> Hidden -> Frozen -> Discarded

- 网页被浏览器丢弃后，用户重新打开其所在 Tab：Discarded -> Active

## 事件

生命周期各阶段都有对应事件。以下事件中除 freeze 和 resume 是新定义的外，其它都是现有的

### focus

在页面获得焦点时触发，如网页从 Passive 变为 Active

### blur

在页面失去焦点时触发，如网页从 Active 变为 Passive

### visibilitychange

在网页可见状态发生变化时触发，可通过`document.onvisibilitychange`指定其回调。一般发生在以下场景：

- 用户隐藏页面（切换 Tab、最小化浏览器等），页面由 Active 变为 Hidden

- 用户重新访问隐藏的页面，页面由 Hidden 变成 Active 阶段

- 用户关闭页面，页面会先进入 Hidden，在进入 Terminated

### freeze

在网页进入 Frozen 阶段时触发，可通过`document.onfreeze`指定其回调。后者最长只能运行 500ms，且不能发起新的网络请求，只能复用已打开的网络连接

注意当从 Frozen 进入 Discarded 时不会触发任何事件

### resume

在网页离开 Frozen 阶段，变为 Active / Passive / Hidden 时触发，可通过`document.onresume`指定其回调

### pageshow

在用户加载网页时触发，可能为全新的页面，也可能从缓存中获取。若为后者，则事件对象`event.persisted`为 true，否则为 false

该事件本质与页面可见性无关，只于浏览器 History 记录的变化有关

### pagehide

在用户离开当前页，进入另一网页时触发。若浏览器将当前页缓存以供稍后重用，则事件对象`event.persisted`为 true，且页面进入 Frozen 状态。否则页面 Terminated

该事件本质与页面可见性无关，只于浏览器 History 记录的变化有关

### beforeunload

在窗口即将关闭时触发。触发时页面仍然可见，且仍可取消关闭。经过该事件后网页进入 Terminated 状态

### unload

在页面正被卸载时触发，之后网页进入 Terminated 状态

## 获取当前状态

- 可通过以下代码判断页面是否处于 Active/Passive/Hidden 阶段

  ```js
  const getState = () => {
  	if (document.visibilityState === "hidden") {
  		return "hidden";
  	}
  	if (document.hasFocus()) {
  		return "active";
  	}
  	return "passive";
  };
  ```

- 可通过事件监听判断是否处于 Frozen / Terminated 阶段

  - 监听到 freeze 事件，则说明进入 Frozen 阶段

  - 监听到 pagehide 事件，则说明进入 Terminated 阶段

- 可通过`document.wasDiscarded`判断页面是否是从 Discarded 阶段返回的，若是则 window 对象会新增`window.clientId`和`window.discardedClientId`用来恢复丢弃前的状态

  ```js
  if (document.wasDiscarded) {
  	//  该网页曾被浏览器丢弃过
  	// 尝试恢复以前的状态
  	getPersistedState(self.discardedClientId);
  }
  ```
