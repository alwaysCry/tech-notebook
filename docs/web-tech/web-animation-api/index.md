# Web Animations API 实现 JS keyframes 动画

Web Animations API 就是把 CSS3 animation 变成了 JS 代码实现：

- CSS3 Animations 动画简单、灵活、复用性强，适合静态动画效果；
- Web Animations 参数由 JS 控制，与单个元素绑定，适合不固定的动态动画效果，例如随机动画；

## 兼容性

目前兼容性如下（2018）

- Chrome 和 Firefox 原生支持
- Safari（PC/IOS）仍作为实验性质属性，但有 polyfill：https://github.com/web-animations/web-animations-js
- IE11 支持主要功能和属性

## 语法

其语法如下：

```js
var animation = element.animate(keyframes, options);
```

- keyframes 对应 CSS3 @keyframes 中的声明块
- options 对应 animation- 属性及属性值
- animation 为动画对象，包含多种方法

以下为一个淡入淡出效果的实现：

<FadeInOut />

@[code{5-18} js](./FadeInOut.vue)

## 参数说明

- keyframes：使用数组表示，其中的每项都对应一个关键帧，后者使用 offset 表示动画进行的百分比，并包含相应 CSS 属性，例如：  
  `{ opacity: 1, offset: 0.4 }` 等同于 CSS 中 `40% { opacity: 1; }`，即动画进度 40% 时透明度为 1

- options 可为动画时间长度，或具体配置对象。例如以下就是 3 秒淡出效果，与 CSS3 animation 默认 ease 类型不同，前者默认是 linear 线性的：

  ```js
  element.animate([{ opacity: 0 }, { opacity: 1 }], 3000);
  ```

  而若 options 是配置对象时，基本与 CSS3 animation 的属性对应，例如：

  - duration 表示时长；
  - delay 表示动画延迟执行时间；
  - fill 表示动画前后保持的状态，
  - easing 表示缓动类型，指为 steps()时候表示断片分步走；
  - iterations 表示动画执行次数，若为无限次，则 Infinity 表示。（注意不要与 CSS3 中的 infinite 搞混）

## 动画对象

Web Animations 提供了一些用于控制动画的方法。如下：

- animation.cancel()： 取消动画，立即清除所有关键帧效果
- animation.finish()： 直接结束动画
- animation.pause()：暂停动画
- animation.play()：暂停后继续
- animation.reverse()：反向播放
- animation.updatePlaybackRate()：设置动画速度，大于 1 表示加速，小于 1 表示减速。相比直接设置 playbackRate 属性值，该方法内部做了优化，不会出现因为速度变化而突然跳动的情况

事件接口如下：

- animation.oncancel：动画取消触发的回调
- animation.onfinish：动画结束触发的回调

属性如下：

- animation.currentTime：动画当前时间值，单位毫秒，无论动画暂停与否都会有。若动画缺失时间线、未执行或者未激活，则返回 null
- animation.effect：获取或设置动画效果，通常是个关键帧效果对象
- animation.finished：只读，当前动画是否完成的 Promise
- animation.id：获取或者设置动画唯一的字符标识，默认为空字符串
- animation.playState：只读，当前动画播放的状态，例如播放中的动画返回 running
- animation.playbackRate：获取或设置动画播放速率。默认为 1
- animation.ready：只读，当前动画是否准备好的 Promise
- animation.startTime：获取或设置动画开始播放的预定时间
- animation.timeline：获取或设置此动画相关联的时间线
