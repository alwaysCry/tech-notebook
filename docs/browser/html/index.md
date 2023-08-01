# HTML 概要总结

## 标签解析规则

- 标签内容头尾空格将被忽略

- 标签内容里的多个连续空格（含制表符）将被合并为一个

- 标签内外的换行符和回车符将被替换为空格，连续同样会被合并为一

要想避免可参见空格字符的实体标识法

## HTML 字符编码

HTML 中允许使用 Unicode 码点，格式形如：`&#<code>`（十进制）或`&#xN`（十六进制），浏览器会自动将其转为对应字符文本。常用于歧义符号的表示，如`<`和`>`

为更容易记忆，HTML 还为一些特殊字符规定了别名，这称为**实体表示法**（entity）。以下为部分对照：

- `<`:`&lt;`

- `>`：`&gt;`

- `"`：`&quot;`

- `'`：`&apos;`

- `&`：`&amp;`

- SPACE 空格：`&nbsp;`（宽度受字体影响。会影响 inline-block 布局）

- 半角空格：`&ensp;`，（1/2 中文宽度，基本不受字体影响。中文排版的首选之一）

- 全角空格：`&emsp;`，（1 个中文宽度，基本不受字体影响。也是中文排版的首选之一）

## URL 简介

[参见](https://wangdoc.com/html/url)

## 元素特性及部分全局特性

元素特性名不分大小写。以下为一些常见全局特性：

- id：必须全局唯一其值不得包含空格

- lang：指定元素默认语言，常用于`<html>`上

- lang：指定元素文字的阅读方向，可选值：`ltr`、`rtl`、`auto`。常用于`<html>`上

- accesskey：指定元素获得焦点的快捷键，须为单个可打印字符，且使用时须连同功能键一起按下才会生效。其优先级低于操作系统或浏览器级的快捷键

- tabindex：表示 Tab 键焦点转移的顺序。大部分情况下仅用于使默认无法获得焦点的元素参与遍历，顺序最好由浏览器决定（对应`0`值）。常用值：

  - `-1`：虽可获得焦点，但不参与 Tab 键遍历

  - `0`：按自然顺序参与 Tab 键遍历

  - 正整数：按从小到大顺序参与 Tab 键遍历。多个值相同则按元素在源码中出现顺序

- data-\*：表示自定义特性

## 基本标签

### `<!DOCTYPE>`

告知浏览器如何解析网页，一般声明为`<!doctype html>`即可

### `<html>`

标签树顶层节点，也称根元素（root element）

### `<head>`

用于放置网页元信息的容器标签，其子节点一般有：

- `<meta>`：用于设置网页元数据，一个`<meta>`标签即对应一项。应放在`<head>`内的顶层。其上可声明以下特性：

  - charset：取决于网页的实际编码方式，一般为`utf-8`

  - name、content：成对使用，前者表示元数据名，后者表示其值

  - http-equiv、content：成对使用，用于补充返回该页面自身的 HTTP 响应的头信息
      <!-- TODO：http-equiv 用法待深入了解 -->

- `<title>`：指定网页标题

- `<link>`：连接外部样式表

- `<style>`：放置内嵌的样式表

- `<script>`：引入脚本

 <!--  - `<noscript>`：浏览器不支持脚本时所显示的备选内容 -->

  <!-- - `<base>`：设置网页内部相对 URL 的计算基准 -->

## 语义化结构标签

### `<main>`

表示页面的主体内容，`<body>`下的顶层标签，只能存在一个

### `<header>`

可表示网页的页眉，放置导航及搜索栏等；或用于`<article>`内顶部，放置文章标题、作者等信息。不可相互或与`<footer>`嵌套

### `<footer>`

可表示网页的页尾，常包含版权或其他相关信息；或用于`<article>`内尾部。不可相互或与`<header>`嵌套

### `<nav>`

用于放置导航信息

### `<article>`

页面中一段完整内容，常为一篇文章或帖子

### `<section>`

表示一个含有主题的独立部分或一个章节，常包含在`<article>`中

### `<aside>`

用于放置间接相关的内容，如网页的侧边栏或文章的补充信息、评论等

## 图像标签

### `<img>`

无闭合标签，默认行内元素并以原始大小显示，可放在`<a>`内部使其成为链接。主要特性：

- alt：图片不显示时（下载失败或用户关闭图片加载）的备选文本

- width、height：指定图片显示时的宽高，一旦设置则无论是否加载成功都将预留此大小的空间。一般不建议使用（因为可在 CSS 中设置）

- referrerpolicy：用于设置图片请求的 Referer 头

- crossorigin：是否加载跨域图片。默认不加载，但此特性一经设置（无论何值）就将变为加载，且请求中将包含 Origin 头。可选值：

  - anonymous：跨域请求不携带用户凭证（通常是 Cookie），省略值部分也是一样

  - use-credentials：跨域请求将携带用户凭证

- loading：指定是否开启懒加载。可选值：

  - auto：默认值，取浏览器默认行为

  - lazy：懒加载，仅当滚动入视口变为可见时才会加载。注意其可能导致重排，最好先指定好图片宽高

  - eager：立即加载，无论其在页面上哪个位置

- srcset：列出所有可用图像的 URL。单独设置时用于指定不同像素密度下的适配图像。其值为逗号分隔字符串，每部分由图像 URL，加可选的像素密度描述符组成，二者以空格分隔，如下。浏览器会根据当前设备像素密度选择需加载的图像，都不符合则仍由 src 指定

  ```html
  <img srcset="p320.jpg, p480.jpg 1.5x, p640.jpg 2x" src="p640.jpg" />
  ```

- sizes：列出不同设备下图像的显示宽度。其值为逗号分隔字符串，除末尾部分，其余部分由一个放在括号中的媒体查询表达式，加图像显示宽度组成，二者以空格分隔，如下。浏览器将根据当前设备宽度判断该图像的显示宽度，再从 srcset 特性值（此时将包含宽度描述符）中找出最接近该宽度的图像加载。该特性不能单独设置，必须与 srcset 搭配

  ```html
  <img
  	srcset="p160.jpg 160w, p320.jpg 320w, p640.jpg 640w, p1280.jpg 1280w"
  	sizes="(max-width: 440px) 100vw, (max-width: 900px) 33vw, 254px"
  	src="p1280.jpg"
  />
  ```

### `<picture>`

用于**适配**不同像素密度、大小的屏幕，本质为容器标签，内部可使用：

- `<source>`，其 media 特性用于设置媒体查询表达式，srcset 特性与`<img>`上的一致。浏览器按其出现顺序依次判断当前设备是否满足其对应媒体查询表达式，如满足则加载 srcset 指定的图片文件，且不再后续执行

- `<img>`，默认加载图像，用于满足其上所有`<source>`均不匹配或浏览器不支持`<picture>`的情况。如下：

  ```html
  <picture>
  	<source srcset="pc.png, pc-2x.png 2x" media="(min-width: 990px)" />
  	<source srcset="tablet.png, tablet-2x.png 2x" media="(min-width: 750px)" />
  	<img srcset="mobile.png, mobile-2x.png 2x" />
  </picture>

  <!-- 还可用于 Webp 格式图像的向后兼容处理 -->
  <picture>
  	<source type="image/webp" srcset="logo.webp" />
  	<img src="logo.png" />
  </picture>
  ```

### `<figure>`、`<figcaption>`

前者为一个将主体内容与附加信息封装在一起的语义容器，可用于封装图像、引言、代码、诗歌等；后者为前者的可选子元素，表示附加信息

## 列表标签

### `<ol>`

有序列表容器，内部列表项前默认生成数字编号。其内部可嵌套`<ol>`或`<ul>`以形成多级列表。主要特性：

- reversed：布尔特性，使编号倒序

- start：整数值，表示起始编号

- type：指定编号风格。可选值：

  - `a`：小写字母

  - `A`：大写字母

  - `i`：小写罗马数字

  - `I`：大写罗马数字

  - `1`：整数（默认值）

### `<ul>`

无序列表容器，内部列表项前默认生成实心小圆点。其内部可嵌套`<ol>`或`<ul>`以形成多级列表

### `<li>`

表示列表项，用于`<ol>`或`<ul>`中。主要特性：

- value：当前列表项编号，后续列表项编号将以该值为起始

### `<dl>`

表示一组术语列表（description list）

### `<dt>`、`<dd>`

均为`<dl>`子元素：前者表示术语名（description term）；后者表示术语解释（description detail），默认会在前者下方缩进显示

## 表格标签

### `<table>`

块级容器标签，所有表格相关内容都要放在其中

### `<caption>`

表示表格的标题，须为`<table>`的第一个子元素，可选

### `<thead>`、`<tbody>`、`<tfoot>`

分别表示表头、表体、表尾，相互间有顺序要求，均为可选。大型表格可使用多个`<tbody>`表示连续的多个部分

### `<colgroup>`

`<table>`的一级子元素，用于包含一组列定义

### `<col>`

仅用于`<colgroup>`的子元素以定义表格的一列，无结束标志和元素，主要作用为申明表格结构及附加样式。可为其附加 class，相关样式将对整个表格生效。主要特性：

- span：正整数值，默认 1。大于 1 则表示为多列合并

### `<tr>`

表示表格的一行

### `<th>`，`<td>`

仅用于`<tr>`的子元素。前者为标题单元格，注意其可用于任何位置，但一般用于第一行（列标题）以及其余行的第一列（列标题）；后者为数据单元格。主要特性：

- colspan、rowspan：正整数值，默认 1。前者表示行内多单元格合并，后者表示列内多单元格合并

- headers：仅用于`<td>`，其值为对应`<th>`的 id，多单元格合并下则为以空格分隔的多个 id 值

- scope：仅用于`<th>`，表示其标题类型，可选值：

  - row：行标题

  - col：列标题

  - rowgroup：多行合并标题

  - colgroup：多列合并标题

  - auto：默认值，由浏览器决定

## 链接标签

### `<a>`

定义一个超链接，默认带文字下划线样式。此外内部也可放置图像等多媒体元素。主要特性：

- href：链接指向的地址，其值通常为 URL 或锚点

  - 若值为空字符，表示点击后刷新当前页

  - 若值为`#`，表示点击后回到页面顶部

  - 若值为`Javascript:void(0)`或`Javascript:;`，表示点击无任何效果，前者写法较合理。通常用于占位，表示其值需动态生成

  - 在移动端，该值还可使用`tel`协议，形如`tel:<phone-num>`，点击时可唤起拨号界面

- target：指定打开链接的方式

  - 若为字符值，则表示在指定名称窗口打开（如 name 属性为指定值的`<iframe>`），没有则新建该名称窗口

  - 若为关键字值：

    - `_self`：默认值，当前窗口中打开

    - `_blank`：新窗口中打开

    - `_parent`：父窗口中打开，通常用于子窗口中，如`<iframe>`内的链接。若当前窗口无父窗口则等同于`_self`

    - `_top`：顶层窗口中打开。若当前窗口即顶层窗口，则等同于`_self`

- rel：指定链接与当前页面的关系，常见值：

  - `alternate`：当前文档的另一种形式，如翻译

  - `author`：作者链接

  - `bookmark`：用作书签的永久地址

  - `external`：当前文档的外部参考文档

  - `help`：帮助链接

  - `license`：许可证链接

  - `next`：系列文档的下一篇

  - `prev`：系列文档的上一篇

  - `search`：文档的搜索链接

  - `tag`：文档的标签链接

  - `nofollow`：告知搜索引擎忽略该链接。主要用于用户提交的内容，防止有人企图通过添加链接，提高该链接的搜索排名

  - `noreferrer`：打开链接时不会将当前地址放在 Referer 请求头中，用以隐藏点击的来源

  - `noopener`：打开链接时，链接窗口无法通过`window.opener`引用原窗口，用以提高安全性

- referrerpolicy：指定点击链接时是否携带 Referer 请求头，及其内容。常用值：

  - `no-referrer`：不携带 Referer 头

  - `same-origin`：同源时才携带 Referer 头

  - `origin`：Referer 头中只携带源信息（协议+域名+端口）

- ping：用以在点击时向指定地址发送一个 POST 请求，常用以跟踪用户行为。注意：

  - 该请求携带`ping-from`头和`ping-to`头，分别表示点击行为发生页地址以及 href 属性指向地址

  - 仅对链接生效，其他交互行为诸如按钮点击或表单提交均无法触发

  - 在 Firefox 中不被支持

- download：作为布尔特性时表示该链接用于下载而非跳转。若具有相应值，则表示下载文件的文件名，但优先级低于`Content-Disposition`头

### `<link>`

用于将当前页面与指定外部资源联系起来，通常放在`<head>`元素内。除最常用于加载 CSS 样式表，还可用于：

- 加载站点的 favicon 文件，如：`<link rel="icon" href="/favicon.ico" type="image/x-icon">`

- 提供站点的 RSS Feed 地址，如：`<link rel="alternate" type="application/atom+xml" href="/blog/news/atom">`

常用特性：

- rel：必需特性，表示资源与该页面间的关系。常用值：

  - `icon`：页面的图标文件

  - `stylesheet`：页面的样式表文件

- media：该资源生效的媒介条件。常用值：

  - `print`：在打印预览页或被打印时生效，如：`<link href="print.css" ref="stylesheet" media="print">`

### `<script>`

用于加载内联或外部脚本代码，具体可[参见](https://zh.javascript.info/script-async-defer)

## iframe

`<iframe>`用于在页面内嵌入其他页面。可包含子元素，会在浏览器不支持`<iframe>`时显示。常用特性：

- allowfullscreen：允许嵌入页面全屏显示，需要相关 API 支持

- frameborder：是否绘制边框：`0`为不绘制，`1`为绘制（默认）。更建议直接在 CSS 中设置相关样式

- src：嵌入页面的 URL

- width：指定显示区域宽度

- height：指定显示区域高度

- importance：指定浏览器下载嵌入页的优先级，可选值：

  - `high`：高优先级

  - `low`：低优先级

  - `auto`：由浏览器自行决定

- name：内嵌页窗口的名称，可用于`<a>`、`<form>`、`<base>`的 target 特性

- referrerpolicy：请求嵌入页时的 Referer 头设置。具体可参见`<a>`标签同名特性

- sandbox：用于设置嵌入页的权限。为布尔特性时表示不具有任何权限；也可为以下权限值列表，每项以空格分隔

  - `allow-forms`：允许提交表单

  - `allow-modals`：允许调用`window.alert`、`window.conform`、`window.print`、`window.prompt`等原生会话 API

  - `allow-popups`：允许调用`window.open`或通过`target="_blank"`实现相同效果

  - `allow-popups-to-escape-sandbox`：允许开启新窗口，并使后者不受 sandbox 策略限制（[参见](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox)）

  - `allow-orientation-lock`：允许使用 JS 锁定屏幕方向，即横屏或竖屏

  - `allow-pointer-lock`：允许使用 Pointer Lock API 锁定鼠标移动

  - `allow-presentation`：允许使用 Presentation API

  - `allow-same-origin`：使嵌入页不会永远被视为是跨源的，否则将总是无法访问 data storage/cookies 以及部分 JS API

  - `allow-scripts`：允许运行脚本（但无法创建新窗口）

  - `allow-storage-access-by-user-activation`：允许在开启`allow-same-origin`的前提下，通过 Storage Access API 访问父窗口的 Cookie

  - `allow-top-navigation`：允许嵌入对顶级窗口进行导航

  - `allow-top-navigation-by-user-activation`：允许对顶级窗口进行导航，但必须由用户激活

  - `allow-downloads-without-user-activation`：允许在未经用户激活情况下启动下载

  注意：`allow-scripts`与`allow-same-origin`不建议同时设置，否则将使嵌入页能改变或删除其所在`<iframe>`的 sandbox 特性

- loading：用于设置嵌入页的加载行为。可选值：

  - `eager`：立即加载（默认）

  - `lazy`：当`<iframe>`滚入视口后才开始加载。注：若`<iframe>`满足以下任一条件，则将被视为是隐藏的而导致立即加载：

    - 宽/高小于等于 4px

    - 被设为`display: none`或`visibility: hidden`

    - 使用负数值的绝对定位将`<iframe>`置于屏幕外

## 表单标签

### `<form>`

表单容器元素，所属表单控件都须置于其中。特性如下：

- accept-charset：服务器接受的字符编码列表，以空格分隔，默认与网页编码相同

- action：服务器接收数据的 URL

- autocomplete：是否允许浏览器自动填充未被用户填写的控件。可选值：

  - `off`：不允许

  - `on`：允许

- method：提交表单数据的 HTTP 方法，可选值：

  - `post`：放在请求体中发送

  - `get`：以 URL 查询字符形式发送

  - `dialog`：仅当表单位于`<dialog>`内时使用

- enctype：指定本次指定的 MIME 类型，仅当 method 为`post`时设置。可选值：

  - `application/x-www-form-urlencoded`，默认值，数据将被自动 urlencoded

  - `multipart/form-data`

  - `text/plain`

- name：指定表单的名称，必填，且值必须唯一

- novalidate：布尔特性，取消表单提交时的验证
<!--  在未设置的情况下可被表单中以下元素的`formnovalidate`特性覆盖：


- `<button>`

- `<input type="submit">`

- `<input type="image">` -->

- target：指定服务器返回数据的展示窗口

  - 若为字符值，则表示在指定 name 值窗口中展示，无该值窗口则将新建

  - 也可为以下关键字值：

    - `_self`：当前窗口

    - `_blank`：新建窗口

    - `_parent`：父窗口

    - `_top`：顶层窗口

### `<fieldset>`

块级容器标签，表示一个控件组，默认带方框样式。特性如下：

- disabled：布尔特性，设置后组内所有控件均被禁用且不参与提交

- form：指定其所属的`<form>`id

- name：指定此控件组名称

### `<legend>`

仅作为`<fieldset>`的首个子元素，用于设置其标题，默认会嵌入在控件组上边框中显示

### `<label>`

行内元素，提供控件的文字说明，同时增加控件的可访问性（点击`<label>`将等同于点击其关联控件本身）。特性如下：

- for：指定关联控件 id。也可将控件作为`<label>`的子元素，此时该属性无需设置

- form：指定关联`<form>`id。若已在其内部，则该属性无需设置

### `<input>`

行内控件元素，无结束标志。具体类型取决于 type 特性，默认为`text`，即输入框。常用特性：

- autofocus：布尔特性，页面加载时自动获得焦点

- disabled：布尔特性，禁用该控件

- form：指定关联`<form>`id。若已在其内部，则无需设置

- list：指定关联`<datalist>`id

- name：指定控件名称，当表单提交时将作为相应键值对的键名。注意若该特性未被设置，无法被提交

- readonly：布尔特性，是否只读

- required：布尔特性，是否必填

- value：指定控件的初始值及其 defaultValue 属性，后者该控件在表单重置后的值

- type：指定控件类型，详见下文

### `<input type="text">`

普通文本输入框，无法输入换行符。专属特性如下：

- maxlength：最大字符数，须为非负整数

- minlength：最小字符数，须为非负整数，且小于 maxlength

- pattern：正则表达式，如用户输入无法匹配，则提交将被阻止且浏览器会弹出提示

- placeholder

- size：指定输入框的显示长度，按字符数计，须为正整数，默认 20。超过则须移动光标才能看到

- spellcheck：布尔特性，开启输入拼写检查

### `<input type="email">`

电子邮箱输入框。提交前将自动验证其格式，若不符合则阻止提交并弹出提示。专属特性基本同`type="text"`，额外特性如下：

- multiple：布尔特性，允许输入多个以逗号分隔的电子邮箱

### `<input type="url">`

url 输入框。提交前将自动验证其格式，若不符合则阻止提交并弹出提示。注意其值必须带协议。专属特性同`type="text"`

### `<input type="passwd">`

密码输入框，用户输入将被遮挡。专属特性基本同`type="text"`， 无 spellcheck，额外特性如下：

- autocomplete：是否允许自动填充，可选值：

  - `on`：允许

  - `off`：不允许

  - `current-password`：填入已保存的当前站点密码

  - `new-password`：自动生成一个随机密码

- inputmode：指定允许输入的数据类型，常用可选值：

  - `none`：不使用系统输入法

  - `text`：标准文本输入

  - `decimal`：数字，含小数

  - `numeric`：纯数字

### `<input type="number">`

数字输入框，仅限输入数字。通常其最右侧存在一个可点击的上下箭头，用于数字递增或递减。专属特性如下：

- max：最大数值

- min：最小数值

- placeholder

- step：点击箭头时数值递增或递减的步长，用户输入值也会自动舍入到最接近步长倍数的值。默认为 1

### `<input type="tel">`

号码输入框。无默认验证模式，需自定义验证。专属特性基本同`type="text"`， 无 spellcheck

### `<input type="search">`

搜索文本输入框，基本等同于`type="text"`。部分浏览器下会在输入时于尾部显示删除按钮

### `<input type="button">`

无默认行为的按钮。建议使用`<button>`代替：一则语义更清晰、二则后者还可拥有子元素

### `<input type="submit">`

表单提交按钮，标题由 value 特性指定，默认为 Submit。以下专属特性同`<form>`标签相应设置，但优先级更高

- formaction

- formenctype

- formmethod

- formnovalidate

- formtarget

### `<input type="image">`

图片形式的提交按钮。除具有额外特性`alt`、`src`、`height`、`width`外，其余特性与`type="submit"`一致

其被点击提交时会额外附带`x`、`y`参数，即相对于图片左上角的坐标。例如该元素 name 为`position`，则提交数据形如：`position.x=<x>&position.y=<y>&...`

### `<input type="reset">`

重置按钮。点击后其所在表单内的所有控件均被重置为初始值。其标题由 value 特性指定，默认为 Reset

### `<input type="checkbox">`

复选框，可通过布尔特性 checked 指定其是否被选中

- 若所在表单内只有一个同 name 的复选框，则选中后对应的提交数据为`<name>=on`

- 反之若有多个同 name 的复选框，则对应提交数据为`<name>=<value1>&<name>=<value2>...`

### `<input type="radio">`

单选框，可通过布尔特性 checked 指定其是否被选中。同 name 的一组中只能选中一项，提交值取其`value`特性

### `<input type="file">`

文件选择框，常用于上传。专属特性如下：

- accept：指定允许的文件类型。可接受以下类型值，按逗号分隔

  - 后缀名，如`.doc`

  - MIME 类型，如`image/jpeg`

  - 通配符表示法，如`audio/*`（任何音频文件）、`video/*`（任何视频文件）、`image/*`（任何图像文件）

- capture：指定捕获图像/视频等，可选值：

  - `user`：面向用户的摄像头或麦克风

  - `environment`：外接摄像头或麦克风

- multiple：布尔特性，允许选择多个文件

### `<input type="hidden">`

无法用于输入的隐藏控件，常用于向服务器传递一些额外信息。如为该控件设置一个唯一的 value 并随同提交以防止伪造表单数据的 CSRF 攻击

### `<input type="range">`

水平滑块控件，滑块默认位置由 value 特性初始值决定，默认为 50。可通过 CSS 改为垂直。专属特性如下：

- max：最大值，默认为 100

- min：最小值，默认为 0

- step：步长值，默认为 1

- list：指定对应`<datalist>`id。与后者配合可在滑动区域产生刻度，如以下代码会在 0-100 间产生 11 个刻度（但不支持刻度文字）

  ```html
  <input type="range" list="ticks" />

  <datalist id="ticks">
  	<option value="0"></option>
  	<option value="10"></option>
  	<option value="20"></option>
  	<option value="30"></option>
  	<option value="40"></option>
  	<option value="50"></option>
  	<option value="60"></option>
  	<option value="70"></option>
  	<option value="80"></option>
  	<option value="90"></option>
  	<option value="100"></option>
  </datalist>
  ```

### `<input type="color">`

颜色选择控件，value 值默认为`#000000`

### `<input type="date">`

日期输入框，value 格式为`<YYYY>-<MM>-<DD>`。专属特性如下：

- max：限制最晚日期

- min：限制最早日期

- step：步长值，单位为天

### `<input type="time">`

时分秒输入框，value 格式为`<hh>:<mm>:[<ss>]`，24 小时制，秒数可选。专属特性如下：

- max：限制最晚时间

- min：限制最早时间

- step：步长值，单位为秒

### `<input type="month">`

年月输入框，value 格式为`<YYYY>-<MM>`。专属特性如下：

- max：限制最晚时间

- min：限制最早时间

- step：步长值，单位为月

### `<input type="week">`

输入一年中第几周的输入框。value 格式为`<yyyy>-W<ww>` 。专属特性如下：

- max：限制最晚时间

- min：限制最早时间

- step：步长值，单位为周

### `<input type="datetime-local">`

年月日时分输入框。value 格式为`<yyyy>-<MM>-<dd>T<hh>:<mm>`。专属特性如下：

- max：限制最晚时间

- min：限制最早时间

- step：步长值，单位为分钟

### `<button>`

无默认行为按钮。特性如下：

- autofocus：布尔特性，页面加载后自动获得焦点

- disabled：布尔特性，禁用该按钮不可用

- type：当按钮位于`<form>`内或与前者相关联时，指定其附带的默认行为。可选值如下：

  - `submit`：默认值（需要注意）

  - `reset`

  - `button`：无默认行为

- form：指定关联`<form>`id。若已在后者内，则可省略该特性

- name：指定按钮名。搭配 value 时可以`<name>=<value>`形式随表单一同提交

- value：指定按钮值。搭配 name 时可以`<name>=<value>`形式随表单一同提交

- formaction、formenctype、formmethod、formnovalidate、formtarget：与其关联`<form>`的相应设置相同，但优先级更高

### `<select>`

下拉菜单控件，以`<option>`子元素来表示菜单项，其 value 值即为被选中的`<option>`的 value。`<option>`的选中状态可通过其布尔特性`selected`设置。特性如下：

- autofocus：布尔特性，页面加载时自动获得焦点

- disabled：布尔属性，禁用该控件

- form：关联`<form>`id

- name：指定控件名

- value：指定控件值

- required：布尔特性，表示必选

- multiple：布尔特性，可多选。多数浏览器下会显示一个滚动列表框，可能需按住 Shift 或其他功能键以选中多项

- size：设置 multiple 时，指定一次显示的行数，其他行需滚动查看

### `<datalist>`

用于为关联控件提供一组相关数据，常用于输入提示，以`<option>`子元素来表示可选项

### `<option>`

可作为`<select>`、`<optgroup>`、`<datalist>`的子元素，表示一个菜单/可选项。特性如下：

- disabled：布尔特性，禁用该项

- label：指定该项的说明，默认等同于该元素文本内容

- selected：布尔特性，表示项被选中

- value：指定该项的值，默认等同于该元素文本内容

### `<optgroup>`

表示一个`<option>`分组，多用于`<select>`内。特性如下：

- disabled：布尔特性，禁用整组`<option>`

- label：指定该分组的标题

### `<textarea>`

块级控件元素，用于输入多行文本。特性如下：

- autofocus：布尔特性，页面加载时自动获得焦点

- cols：指定文本框宽度，默认为 20 字符宽

- rows：指定文本框高度，单位为行。

- disabled：布尔特性，禁用该控件

- form：关联`<form>`id

- maxlength：限制最大字符数

- minlength：限制最小字符数

- name：控件名称

- placeholder

- readonly：布尔特性，只读

- required：布尔特性，必填

- spellcheck：布尔特性，开启输入拼写检查

- wrap：输入的文本是否自动换行，可选值：

  - `hard`：自动插入换行符 CR + LF 使每行不超过控件宽度

  - `soft`：默认值。输入内容超过宽度时自动换行，但不会加入新的换行符，并且浏览器保证所有换行符都是 CR + LR

  - `off`：无自动换行，单行长度超过宽度时出现水平滚动条

### `<output>`

行内元素，用于显示用户操作的结果。特性如下：

- for：关联控件 id，即表示为前者的操作结果

- form：关联`<form>`id

- name：控件名称

### `<progress>`

行内元素，表示任务的完成进度，通常会被显示为进度条。特性如下：

- max：指定最大值，须为大于 0 的浮点数，默认为 1

- value：指定当前值，须为 0 到 max 值之间的有效浮点数。若被省略则进度条出现来回滚动效果，表示正在进行中，进度未知

### `<meter>`

行内元素，表示指示器，用以显示已知范围内的一个值。适合用于任务当前进度、磁盘已用空间、充电量等带比例性质的场合。通常会被显示为一个不会滚动的指示条

注意其子元素仅在浏览器不支持`<meter>`时显示。常用特性：

- min：范围下限，须小于 max，默认为 0

- max：范围上限，须大于 min，默认为 1

- low：“低”范围的上限门槛值。须小于 high，默认等于 min

- high：“高”范围的下限门槛值。须大于 low，默认等于 max

- optimum：表示最佳值，默认为 min 到 max 的中间值。与 low、high 一起使用以表示最佳范围

  - 若小于 low，则最佳范围为“低”范围

  - 若大于 high，则最佳范围为“高”范围

  - 若在 low 和 high 之间，则最佳范围为“中间”范围

- form：关联`<form>`id

- value：当前值，须在 min 和 max 之间，默认为 0。Chrome 会根据其所处范围决定指示条颜色：

  - 最佳范围为绿色

  - 否则依次为黄色和红色

---

<!-- - `<center>`：实现水平居中，本质是其自带`text-align:center;`

- `<abbr>`：用于标识缩写，如`<abbr title="Daily Active User(日活跃用户)">DAU</abbr>`

- `<mark>`：高亮文本

- `<sup>`和`<sub>`：分别表示上标和下标。本质是利用了`vertical-align`的`top`和`sub`特性并将字号缩小

- `<figure>`：定义一块可附加标题的元素内容，其中可用`<figcaption>`标签对包裹内容文本做描述，后者须为`<figure>`的首/末子元素。常用于为图片添加文本标题

- `<area>`：为图片提供点击热区，须搭配`<map>`标签一起使用。如下例为图片定义了上下两个矩形热区

  ```html
  <img src="example.png" width="100" height="100" alt="" usemap="#map" />
  <map name="map">
  	<area
  		shape="rect"
  		coords="0,0,100,50"
  		alt="baidu"
  		href="https://www.baidu.com"
  	/>
  	<area
  		shape="rect"
  		coords="0,50,100,100"
  		alt="sougou"
  		href="https://www.sogou.com/"
  	/>
  </map>
  ```

- `<details>`：定义可折叠（默认收起，可添加`open`特性改变）的详情内容。例如：

  ```html
  <details>
  	<summary>点击查看更多</summary>
  	<p>一段被隐藏的详情内容</p>
  </details>
  ```

- `<dialog>`：原生会话框标签，自带 DOM 方法`showModal`、`close`分别控制其展示和隐藏，默认支持 ESC 键关闭

- `<noscript>`：作为页面禁用 javascript 时的备选提示
 -->
