# package.json 部分属性解读

<!-- name、version、repository、description、keywords、homepage、bugs、license  -->

## name

定义项目（包）名。规则如下：

- 不得多于 214 个字符（包含`@<scope>/`前缀在内）

- 不得以`.`、`_`开头，且不得包含大写字母

- 只允许使用 URL-safe 字符

## version

定义项目（包）的当前版本号

## description

定义项目（包）的简要描述。registry 将提取该信息以方便搜索

## keywords

定义项目（包）的关键字描述。registry 将提取该信息以方便检索

## license

<!-- TODO -->

## homepage

项目（包）的主页/文档地址

## bugs

项目（包）的问题汇报页面地址或相关 email

## repository

项目（包）所在的源代码管理仓库地址

## author

项目（包）的作者信息。形如：

```json
{
	"author"：{
		"name":"<name>",
		"email":"<email>",
		"url":"<homepage-url>",
	}
}
```

## contributors

项目（包）的贡献者信息。一般为数组形式，元素格式同 author

## files

指定作为包发布（publish）至 registry 时上传的文件，可包含目录和通配符。形如：

```json
{
	"files": ["filename.js", "directory/", "glob/*.{js,json}"]
}
```

要点：

- 通常包含构建产物及相关类型文件，而 src、test 等目录下文件无需一同发布

- package.json、license、README 以及`package.json#main`指定的文件将被默认包含

- node_modules、lockfile 等文件将被默认忽略

- .npmignore 中所列文件即便位于 files 中也会被排除，其格式与.gitignore 类似。且若项目中缺少.npmignore，则默认将使用.gitignore 的内容

## type

指定 Node.js 以何种模块化形式解析`.js`后缀文件。可选值：

- `"commonjs"`：默认值，视为 CommonJS

- `"module"`：视为 ESM

注：不论该字段为何值，`.cjs`后缀文件始终视为 CommonJS，`.mjs`后缀文件始终视为 ESM

## main

指定包作为 CommonJS 被引入时的入口文件路径（默认为包目录下的`./index.js` ）

## module

指定包作为 ESM 被引入时的入口文件路径。该属性仅被现代化构建工具感知，node.js 的包引入机制会将其忽略，后者仅参考 main 和 exports

## browser

指定包被用于构建浏览器端产物时的入口文件地址。该属性仅被构建工具感知，且其指向文件通常为 IIEF 或 UMD 形式

## exports

按最高优先级定义包的公共入口。具体如下：

- 允许定义多个入口。形如：

```json
{
	"exports": {
		/* 对应包名引入 */
		".": "./lib/index.js",
		/* 对应包子路径引入，如 import <pkg> from '<pkg-name>/lib' */
		"./lib": "./lib/index.js",
		/**
		 * 支持路径通配符 *，后者可被展开为任意子路径而不仅限于文件名
		 * 此处设定 .js 后缀则限定了只导出 js 文件
		 */
		"./feature/*.js": "./feature/*.js",
		/* 通过此方式限制某个子路径下的包导出 */
		"./feature/private-internal/*": null,
		/* 一些 UI 包可能需要引入部分样式才能正常使用 */
		"./style": "./dist/css/index.css",
		"./package.json": "./package.json"
	}
}
```

- 提供不同环境下的情景导出，当作为 Node.js 包被引用时：

  ```json
  {
  	"exports": {
  		/* 按 ESM 引入时的包入口 */
  		"import": "./index-module.js",
  		/* 按 CommonJS 引入时的包入口 */
  		"require": "./index-require.js"
  	}
  }
  ```

  现代化构建工具如何处理则可参见：

  - [vite#resolve.conditions](https://cn.vitejs.dev/config/shared-options.html#resolve-conditions)
  - [webpack#Package exports](https://www.webpackjs.com/guides/package-exports/)

注意：

- 对于 Node.js v14 以及大多数现代化构建工具而言，其优先级高于 main

- 未在 exports 中被显式定义的入口（含 package.json）将无法被引入

- 若 exports 中仅包含`.`属性，则可将其简写。例如：

  ```json
  {
  	"exports": {
  		".": "./index.js"
  	}
  	/**
  	 * 可被简写为:
  	 *
  	 * "exports":"./index.js"
  	 */
  }
  ```

- 直接引入 node_modules 目录下对应的包文件依然是可行的，如`require(<path-to-node_modules>/<pkg>/<file>.js)`

## workspaces

指定项目的 workspaces 目录，具体[参见](https://classic.yarnpkg.com/en/docs/workspaces/)，接受通配符。形如：

```json
{
	"workspaces": ["packages/*"]
}
```

## directories

提供项目（包）元信息，常用子字段如下：

- lib：有关库在包中的确切位置
- bin：所有可执行文件所在的目录，可用于代替具有 bin 属性
- man：所有手册页所在的目录
- doc：有关包文档所在目录
- example：有关示例代码的目录
- test：有关测试文件所在目录

## bin

用于在带有 CLI 的项目（包）中指定相关命令对应的可执行文件。形如：

```json
{
	"bin": {
		"webpack": "bin/index.js"
	}
}
```

当其通过包管理工具被安装时：

- 全局安装会在`/usr/local/bin`（win 默认`C:\Users\<username>\AppData\Roaming\npm`）目录下创建指向对应可执行文件的软链接

- 局部安装则将软链接创建在项目的`node_modules/.bin`目录下。对应命令可通过以下方式调用：

  - `npx <command>`

  - 或出现在`package.json#scripts.<action>`对应的脚本中

## scripts

指定项目级脚本命令，后者可通过`npm run <action>`执行。形如：

```json
{
	"scripts": {
		"<action>": "<command>",
		"pre<action>": "<pre-command>",
		"post<action>": "<post-command>"
	}
}
```

每个 action 还可通过添加`pre`/`post`前缀定义相应的前置/后续脚本命令，如当执行`npm run build`时会按 prebuild -> build -> postbuild 顺序依次执行相应脚本

注意此类隐式逻辑很可能造成工作流混乱，因而在 pnpm 和 yarn2 中都已废弃，[参见](https://github.com/pnpm/pnpm/issues/2891)。如需手动开启：

- pnpm 中可设置 `.npmrc > enable-pre-post-scripts=true`

## config

为 scripts 脚本设置环境变量。形如：

```json
{
	"config": {
		"<name>": "<value>"
	}
}
```

脚本执行时可以`$npm_package_config_<name>`形式访问

## dependencies

运行依赖，在生产环境下也会用到

## devDependencies

开发依赖，在生产环境下不会用到。install 命令在以下情况下不会安装 devDependencies：

- 环境变量`NODE_ENV`为`production`时

- 执行 install 命令时附带选项`--production=true`

## peerDependencies

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

## optionalDependencies

可选依赖，表示依赖不会阻塞主功能的使用，安装或者引入失败也无妨。即使其安装失败，npm 的整个安装过程也是成功的。使用 `npm install xxx -O` 或 `npm install xxx --save-optional` 时自动插入其中

如使用 colors 包来对 console.log 打印信息进行着色来增强和区分提示。它并非必需，所以可以将其列入 optionalDependencies，并在运行时处理引入失败的逻辑

## peerDependenciesMeta

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

## bundleDependencies

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

## overrides

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

## private

若是私有项目，不希望发布至公共 npm 仓库上，可将 private 设为 true

## publishConfig

顾名思义，即 npm 包发布时使用的配置

例如在安装依赖时指定了 registry 为 taobao 镜像源，但发布时希望在公网发布，则可指定 publishConfig.registry：

```json
{
	"publishConfig": {
		"registry": "https://registry.npmjs.org/"
	}
}
```

<!-- 与项目关联的系统配置，如 node 版本或操作系统兼容性之类。大多只起到提示，即使用户环境不合要求也不影响依赖安装 -->

## engines

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

## os

linux 正常运行的项目可能在 windows 上会出现异常，使用 os 可以指定项目对操作系统的兼容性要求。例如：

```json
{
	"os": ["darwin", "linux"]
}
```

## cpu

指定项目只能在特定的 CPU 体系上运行：

```json
{
	"cpu": ["x64", "ia32"]
}
```

<!-- 一些三方库或应用在内部处理时会依赖这些字段，使用时需要先安装对应三方库 -->

## types 或 typings

指定 TypeScript 的类型定义的入口文件。例如：

```json
{
	"types": "./index.d.ts"
}
```

## unpkg

该字段应指向一文件，unpkg 稍后将为后者提供 CDN 支持，详情[参见](https://unpkg.com/)

## jsdelivr

与 unpkg 类似

## browserslist

设置项目的浏览器兼容情况。babel 和 autoprefixer 等工具会根据该配置对代码进行转换。当然也可以使用 .browserslistrc 文件单独配置。典型的：

```json
{
	"browserslist": ["> 1%", "last 2 versions"]
}
```

## sideEffects

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

## lint-staged

lint-staged 是用于对 git 暂存区文件进行操作的工具，可在代码提交前执行 lint 校验、类型检查、图片优化等操作，也通常配合 husky 等 git-hooks 工具一起使用。后者用于定义钩子方法，并在 git 工作流中如 pre-commit，commit-msg 时触发，可把 lint-staged 放到这些钩子方法中（？？？）
