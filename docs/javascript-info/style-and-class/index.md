# 元素样式和类的概述

可通过操作元素的 “class” 或 “style” 来修改其样式，前者是首选

## className 和 classList

元素的 className 属性对应于 class 特性（attribute）

另一个 classList 属性是一个可迭代的特殊对象，具有 add/remove/toggle/contains 等方法：

- elem.classList.add/remove(class) —— 添加/移除类
- elem.classList.toggle(class) —— 若类不存在就添加，存在就移
- elem.classList.contains(class) —— 检查给定类，返回 true/false

## style

元素的 style 属性是一个对象，对应于 style 特性（attribute）中所写内容，但使用驼峰式（camelCase）CSS 属性名

:::tip 注意
类似 -moz-border-radius 的浏览器前缀属性同样遵循驼峰式规则：-> MozBorderRadius
:::

## style 相关操作

### 设置

- style 是一个只读对象，只可通过 `elem.style.* = ...` 来为各个属性赋值，而非 `elem.style= {...}`

- 要想完全重写元素样式，可使用 `elem.cssText = "..."` 或 `elem.setAttribute('style', "...")`

:::tip 注意单位
勿忘样式值中的 CSS 单位
:::

### 移除

移除样式属性，应将其赋值为空字符，其表现会如同没有该属性；也可使用`elem.style.removeProperty([styleProperty])` 方法，例如：

```js
document.body.style.background = "";
// 等价于
document.body.style.removeProperty("background");
```

### 读取

CSS 样式计算中存在两个概念：

- **计算 (computed)** 样式值：应用了所有 CSS 继承与规则后的值，即 CSS 级联（cascade）后的结果，形式上类似 `height:1em` 或 `font-size:125%`
- **解析 (resolved)** 样式值：最终应用于元素的样式值。诸如 1em 或 125% 的相对值会被替换为绝对单位的计算（computed）值，可能具有浮点，如：`width:50.5px` 或 `font-size:16px`

:::warning 注意
解析值仍可能为非具体值，如 `auto`
:::

考虑到 CSS 级联，无法从 `elem.style` 中获取元素的最终样式，而应使用 `getComputedStyle(elem, [pseudo])` ，该方法返回了**解析**样式值：

- element: 需读取样式值的元素
- pseudo：指定伪元素（若有需要），如 `::before`

返回类似于 `elem.style`的驼峰样式属性对象

:::warning 注意
考虑到隐私，无法用 `getComputedStyle` 来获取 `:visited` 元素的样式，防止开发者以此窥探用户是否访问了链接；

此外 CSS 中也禁止在 :visited 中应用更改几何形状的样式
:::
