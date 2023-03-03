# CSS 中内联 SVG 技术

(TODO: 是否可扩展此文至 => CSS 中内联图片技术)

## base64 内联

先将 svg 转为 base64 类型的 data-url，再赋值给 `background-image` 属性即可。例如：

```js
const svgStr = `<svg viewBox="0 0 16 16">...</svg>`;
const blob = new Blob([svgStr], { type: "image/svg+xml" }); // 先转换为 blob
// 再通过 fileReader 将其转换为 base64
const reader = new FileReader();
reader.readAsDataURL(blob);
reader.onload = () => {
	const cssText = `...; background-image: url('${reader.result}'); ...`;
};
```

## 直接内联

也可将 svg 文本直接内联进 data-url，注意必须先经过转义。例如：

```js
const svgStr = `<svg viewBox="0 0 16 16">...</svg>`;
const cssText = `...; 
  background-image: url('data:image/svg+xml,${encodeURIComponent(svgStr)}');
  ...
`;
```

<!-- <CSSInlineSVG /> -->
