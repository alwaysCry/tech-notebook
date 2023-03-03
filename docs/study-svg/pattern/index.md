# Pattern

介绍 SVG `<pattern>` 元素的主要属性

## patternUnits

该属性决定`<pattern>`元素几何属性（x、y、width、height）的参照坐标系，可选值：

- objectBoundingBox（默认）：相对于被附加元素的边界框，百分比形式（最大值为 1），或可认为后者的`viewBox="0,0,1,1"`

  @[code{2-27} html](./ObjectBoundingBox.vue)
  <ObjectBoundingBox />

- userSpaceOnUse：相对于用户坐标系

  @[code{2-22} html](./UserSpaceOnUse.vue)
  <UserSpaceOnUse />

## patternContentUnits

用于定义内部元素几何属性的参照坐标系，可选值同样为 objectBoundingBox 和 userSpaceOnUse，但默认为后者

如下所示，左右展示效果一致，但左侧`<pattern>`内`<rect>`的 width 为 20，而右侧为 0.2

@[code{2-39} html](./PatternContentUnits.vue)
<PatternContentUnits />
