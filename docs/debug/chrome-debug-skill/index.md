# 调试技巧

## console 相关

- `console.time`/`console.timeEnd`：此二方法配合使用以计算代码段执行时间

- `console.assert`：首参为 falsy 时在控台输出次参，可减少判断逻辑书写

- `console.dir`：用于打印 DOM 对象以查看其属性（默认输出其 DOM 层次结构）

- `console.table`：以表格形式打印数组/类数组/对象

## 快捷技巧

### 一键重发请求

1. Network -> Fetch/XHR 中选中相应请求
2. 右键后点击 Replay XHR

### 在控台快速请求

联调或修 BUG 场景，需针对同样请求修改入参后重新发起

1. Network -> Fetch/XHR 中选中相应请求
2. 右键后点击 Copy -> Copy as fetch（还可 Copy as Node.js fetch、Copy as curl 等）
3. 在控台粘贴代码
4. 修改参数，回车

### 快速在控台引用选中元素

1. 在 Elements 选中相应元素
2. 控台通过 `$0` 直接引用

### 一键展开全部（层）DOM

1. 按住 Alt 键（Mac Opt 键）+ 点击最外层元素展开图标

### 全页面 / 指定元素截屏

1. 按 cmd + shift + p
2. 输入 Capture full size screenshot 后按下回车

3. 在 Elements 选中相应元素
4. 按 cmd + shift + p
5. 输入 Capture node screenshot 后按下回车

### 在控台引用上一次的结果

在控台可用 $\_ 引用上一次的结果

### 在控台简写 document.querySelector / document.querySelectorAll

在控台可用 $ / $$ 简写 `document.querySelector` / `document.querySelectorAll`
