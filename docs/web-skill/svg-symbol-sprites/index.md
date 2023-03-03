# SVG`<symbol>`Sprites 技术

`<symbol>`元素拥有 viewBox 等属性，用于定义图形模板，并通过`<use>`来引用

:::warning 注意
`<symbol>` 自身并不可见，只有通过`<use>`引用后才可见
:::

`<use>`的效果类似于深拷贝元素节点，再将其副本插入到`<use>`标签所在位置，且：

- 通过 id 引用，被引用元素无需位于`<symbol>`标签内
- 可多次引用，不限次数
- 可跨 SVG 引用，只需与被引用元素在同一文档中
- 除 x、y、width、height、(xlink:)href 外，其余属性均不会覆盖到被引用元素上

<SymbolAndUse />
