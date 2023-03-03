# package.json 配置解读

package.json 配置可分为 7 大类：描述配置、文件配置、脚本配置、依赖配置、发布配置、系统配置、第三方配置

## 描述配置

name、version、repository、description、keywords、homepage、bugs、license 暂不具体描述

## 文件配置

### files

进行 npm 发布时，默认包括 package.json、license、README 和 main 字段指定的文件；忽略 node_modules、lockfile 等文件

在此基础上可通过 files 指定更多：可为单独文件、目录、或通配符。例如：

```json
{
	"files": ["filename.js", "directory/", "glob/*.{js,json}"]
}
```

一般 files 会指定构建产物及类型文件，而 src、test 等目录下文件无需跟随发布

:::tip
罗列在模块根目录下 .npmignore 中的文件，即使被写入 files 中也会被排除发布

.npmignore 原理与.gitnore 类似，若缺少前者，则默认将使用后者的内容
:::

### type

node 默认要求 ES 模块采用 .mjs 后缀，若不想修改，则可指定 type 为 module；此时若想使用 CommonJS 模块，则需将相应后缀名改为 .cjs

### main

main 字段指定项目入口文件（默认为根目录下的 index.js）， browser 和 Node 环境（此处及以下的环境指的是 webpack 中的 target？？？）中都可用

例如 packageA 的 main 字段指定为 index.js，则其被引用时实际引入的是 `node_modules/packageA/index.js`

在早期只有 CommonJS 规范时，此为指定项目入口的唯一属性

### browser

main 字段指定的入口文件在 browser 和 Node 中都可用。但若只想在 web 端使用，则可通过 browser 字段指定入口。如：`{ "browser": "./browser/index.js" }`

browser 字段的指向通常为 IIFE 或 UMD 模块文件，并且依赖于浏览器环境的全局变量(如 window)

### module

module 字段用于指定 ES 模块的入口文件。当一项目同时定义 main、browser 和 module，而 webpack、rollup 等构建工具会感知前者，并根据环境及不同的模块规范来进行相应的入口文件查找

```json
{
	"main": "./index.js",
	"browser": "./browser/index.js",
	"module": "./index.mjs"
}
```

例如 webpack 构建时默认 target 为 web，即 Web 构建。其 resolve.mainFields 配置默认为 ['browser', 'module', 'main']，即按 browser -> module -> main 顺序查找入口文件

### exports

node 14.13 支持。用于配置不同环境对应的模块入口，并且当其存在时优先级最高

例如用 require 和 import 根据模块规范分别定义入口：

```json
{
	"exports": {
		"require": "./index.js",
		"import": "./index.mjs"
	}
}
```

该配置在使用 `import xxx` 和 `require('xxx')` 时会从不同入口引入文件（exports 还支持 browser 和 node 字段定义对应环境中的入口）。等同于：

```json
{
	"exports": {
		".": {
			"require": "./index.js",
			"import": "./index.mjs"
		}
	}
}
```

加了一个 “.” 层级是因为 exports 除支持配置包的默认导出，还支持配置包的子路径：

比如一些三方 UI 包需引入对应样式文件才能正常使用：`import packageA/dist/css/index.css;`，此时就可用 exports 封装文件路径：

```json
{
	"exports": {
		"./style": "./dist/css/index.css"
	}
}
```

则用户引入时只需：`import packageA/style;`

除封装导出文件路径，exports 还限制使用者访问未在其中定义的任何其他路径。如发布的 dist 文件中有内部模块 dist/internal/module ，被单独引入使用可导致主模块不可用，为了限制外部使用，便可不在 exports 定义这些模块的路径，此时外部引入诸如 packageA/dist/internal/module 模块就会报错

综合上述知识，就很容易理解 vite 官方推荐的三方库入口文件定义了：

![](http://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51da620966234db3ad13f6a0f40414e7~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

### workspaces

项目工作区配置，用于在本地根目录下管理多个子项目。可在 npm install 时自动将 workspaces 下的包软链到根目录 node_modules 中，无需手动执行 npm link

该字段接收一个数组，内部可为目录名或通配符。例如：

```json
{
	"workspaces": ["workspace-a"]
}
```

表示 workspace-a 目录下有一项目，也有自己的 package.json

```
package.json
workspace-a
  └── package.json
```

但通常子项目都会平铺在 packages 目录下，所以根目录下 workspaces 通常配置为：

```json
{
	"workspaces": ["packages/*"]
}
```

### directories

CommonJs 时代常用，其主要作用为提供元信息，其子字段均为指向不同目录的字符串：

- lib：有关库在包中的确切位置
- bin：所有可执行文件所在的目录，可用于代替具有 bin 属性
- man：所有手册页所在的目录
- doc：有关包文档所在目录
- example：有关示例代码的目录
- test：有关测试文件所在目录

## 脚本配置

### scripts

指定项目内置脚本命令，可通过 npm run 来执行。通常包含项目开发、构建等 CI 命令

除指定基础命令，还可配合 pre 和 post 完成命令的前置和后续操作，如下例：

```json
{
	"scripts": {
		"build": "webpack",
		"prebuild": "xxx", // build 执行之前的钩子
		"postbuild": "xxx" // build 执行之后的钩子
	}
}
```

则当执行 npm run build 时，会按照 prebuild -> build -> postbuild 顺序依次执行上方命令

当然这样的隐式逻辑很可能造成工作流执行混乱，所以 pnpm 和 yarn2 都已废弃掉了 pre/post 自动执行逻辑，[参见](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fpnpm%2Fpnpm%2Fissues%2F2891)。如果需手动开启，pnpm 可设置 `.npmrc > enable-pre-post-scripts=true`

### bin

用于指定每个内部命令对应的可执行文件位置。在编写 node 工具时常会用到（npm 本身也是通过 bin 属性安装为一个可执行命令）

在编写 cli 工具时需指定工具的运行命令。如 webpack 模块，其运行命令即 `webpack`，其 package.json 文件配置如下：

```json
{
	"bin": {
		"webpack": "bin/index.js"
	}
}
```

全局安装模块时， npm 会为 bin 中配置的文件在 bin 目录下创建软连接（windows 默认会在 C:\Users\username\AppData\Roaming\npm 目录下）

若局部安装，则软连接创建在项目的 ./node_modules/.bin 目录下。另外，其下的命令都可用 `npm run xxx` 运行，键入 npm run 后按 tab，还会出现提示

### config

用于设置 scripts 内脚本**在运行时**的参数。例如设置 port 为 3001：

```json
{
	"config": {
		"port": "3001"
	}
}
```

则执行时可以通过 `npm_package_config_port` 变量访问到 3001：

```js
console.log(process.env.npm_package_config_port); // 3001
```

## 依赖配置

### dependencies

运行依赖，即项目生产环境下需用到的，使用 `npm install xxx` 或 `npm install xxx --save` 时自动插入其中

### devDependencies

开发依赖，项目开发环境需要而运行时不需要，用于辅助开发

使用 `npm install xxx -D ` 或者 `npm install xxx --save-dev`

### peerDependencies

同伴依赖，一种特殊的依赖，不会被自动安装，常用于表示与另一个包的依赖与兼容性关系以警示使用者

比如安装 A，A 的正常使用依赖 B@2.x 版本，则 B@2.x 应被列在 A 的 peerDependencies 下。例如 React 组件库 Ant Design，其 peerDependencies 为

```json
{
	"peerDependencies": {
		"react": ">=16.9.0",
		"react-dom": ">=16.9.0"
	}
}
```

表示若使用 Ant Design，则项目也应安装 react 和 react-dom，且版本需大于等于 16.9.0

### optionalDependencies

可选依赖，表示依赖不会阻塞主功能的使用，安装或者引入失败也无妨。即使其安装失败，npm 的整个安装过程也是成功的。使用 `npm install xxx -O` 或 `npm install xxx --save-optional` 时自动插入其中

如使用 colors 包来对 console.log 打印信息进行着色来增强和区分提示。它并非必需，所以可以将其列入 optionalDependencies，并在运行时处理引入失败的逻辑

### peerDependenciesMeta

同伴依赖也可以用 peerDependenciesMeta 将其指定为可选。例如：

```json
{
	"peerDependencies": {
		"colors": "^1.4.0"
	},
	"peerDependenciesMeta": {
		"colors": {
			"optional": true
		}
	}
}
```

### bundleDependencies

打包依赖。其值为数组，在发布包时 bundleDependencies 里面的依赖都会被一并打包

例如指定 react 和 react-dom 为打包依赖：

```json
{
	"bundleDependencies": ["react", "react-dom"]
}
```

则执行 npm pack 打包生成的 tgz 包中，将出现 node_modules 并包含 react 和 react-dom

:::warning 注意
该字段数组中的值必须为 dependencies 或 devDependencies 内声明过的依赖
:::

普通依赖通常从 npm registry 安装，但若想用一个不在 npm registry 里的包或一个被修改过的第三方包，打包依赖会比普通依赖更好用

### overrides

overrides 可以重写项目**依赖的依赖**、**及其依赖树下某个依赖**的版本号，进行包的替换

例如某依赖 A，出于一些原因其依赖包 foo@1.0.0 需要替换，则可使用 overrides 修改 foo 的版本号：

```json
{
	"overrides": {
		"foo": "1.1.0-patch"
	}
}
```

当然这样会更改整个依赖树里的 foo，可以只对 A 下的 foo 进行版本号重写（overrides 支持任意深度的嵌套）：

```json
{
	"overrides": {
		"A": {
			"foo": "1.1.0-patch"
		}
	}
}
```

若要在 yarn 中复写依赖版本号，需使用 resolution 字段；而 pnpm 中则需用 pnpm.overrides 字段

## 发布配置

### private

若是私有项目，不希望发布至公共 npm 仓库上，可将 private 设为 true

### publishConfig

顾名思义，即 npm 包发布时使用的配置

例如在安装依赖时指定了 registry 为 taobao 镜像源，但发布时希望在公网发布，则可指定 publishConfig.registry：

```json
{
	"publishConfig": {
		"registry": "https://registry.npmjs.org/"
	}
}
```

## 系统配置

与项目关联的系统配置，如 node 版本或操作系统兼容性之类。大多只起到提示，即使用户环境不合要求也不影响依赖安装

### engines

一些项目由于兼容性问题会对 node 或包管理器有特定版本号要求。如：

```json
{
	"engines": {
		"node": ">=14 <16",
		"pnpm": ">7"
	}
}
```

除非设置 engine-strict 标记，否则只充当建议

### os

linux 正常运行的项目可能在 windows 上会出现异常，使用 os 可以指定项目对操作系统的兼容性要求。例如：

```json
{
	"os": ["darwin", "linux"]
}
```

### cpu

指定项目只能在特定的 CPU 体系上运行：

```json
{
	"cpu": ["x64", "ia32"]
}
```

## 第三方配置

一些三方库或应用在内部处理时会依赖这些字段，使用时需要先安装对应三方库

### types 或 typings

指定 TypeScript 的类型定义的入口文件。例如：

```json
{
	"types": "./index.d.ts"
}
```

### unpkg

该字段应指向一文件，unpkg 稍后将为后者提供 CDN 支持，详情[参见](https://unpkg.com/)

### jsdelivr

与 unpkg 类似

### browserslist

设置项目的浏览器兼容情况。babel 和 autoprefixer 等工具会根据该配置对代码进行转换。当然也可以使用 .browserslistrc 文件单独配置。典型的：

```json
{
	"browserslist": ["> 1%", "last 2 versions"]
}
```

### sideEffects

标识某些模块具有副作用，涉及 webpack 的 tree-shaking 优化

例如使用 Ant Design 时通常还需引入其 css 文件：

```json
import antd/dist/antd.css; // or 'antd/dist/antd.less'
```

假设 Ant Design 的 package.json 中不设置 sideEffects，则 webapck 打包时会认为此代码只引入但未被使用，可被 tree-shaking 剔除，最终导致产物缺少样式

所以 Ant Design 在 package.json 里设置如下 sideEffects，来告知这些文件具有副作用，不能被剔除：

```json
{
	"sideEffects": ["dist/*", "es/**/style/*", "lib/**/style/*", "*.less"]
}
```

### lint-staged

lint-staged 是用于对 git 暂存区文件进行操作的工具，可在代码提交前执行 lint 校验、类型检查、图片优化等操作，也通常配合 husky 等 git-hooks 工具一起使用。后者用于定义钩子方法，并在 git 工作流中如 pre-commit，commit-msg 时触发，可把 lint-staged 放到这些钩子方法中（？？？）
