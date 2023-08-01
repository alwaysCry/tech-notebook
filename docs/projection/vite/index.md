# Vite 总结

## 核心原理

Vite 将应用中的**模块**分为：

- **依赖**：多为开发时不会变动的纯 JS，存在多种模块化格式（ESM、CommonJS、UMD...），将以 esbuild 预构建

- **源码**：常包含需转换的非 JS 格式文件（如 JSX、CSS、Vue/Svelte），会被频繁编辑，无需被同时加载（如基于路由拆分的代码模块）。Vite 开发服务以**原生 ESM**形式提供源码，且只在浏览器请求时做按需转换并提供

---

首次**启动**时将先预构建项目依赖，目的在于：

- 以原生 ESM 形式提供所有代码，要先转换 CommonJS 或 UMD 形式的依赖

- 提高后续加载性能，具有多个内部模块的 ESM 依赖项将被转换为单个模块。如 lodash-es 的所有内置模块将被预构建为单个，执行`import { debounce } from 'lodash-es'`时将只需 1 个 HTTP 请求

---

Vite 的缓存可分为：

- **文件系统缓存**，已预构建的依赖将被缓存至 node_modules/.vite。以下行为将引发重新预构建：

  - 服务器启动后，遇到尚未在缓存中的新依赖项导入

  - 以下任一项改变：

    - 包管理器的锁文件内容（如 package-lock.json、yarn.lock、pnpm-lock.yaml）
    - vite.config.js 中的相关字段
    - NODE_ENV 的值
    - 补丁文件夹的修改时间

  - 启动开发服务器时指定 --force 选项

  - 手动删除 node_modules/.vite 缓存目录

- **浏览器缓存**，利用 HTTP 头加速资源的重新请求

  - 已预构建的依赖请求通过 `Cache-Control: max-age=31536000,immutable` 强缓存

    - 若安装了不同版本的依赖项（反映在包管理器的 lockfile 中），则将通过附加版本查询自动失效

    - 若想通过本地编辑来调试依赖项，则可以：

      1. 在浏览器开发工具 Network 选项卡暂时禁用缓存
      2. 重启开发服务器并指定 --force 选项
      3. 重新载入页面

  - 源码模块请求会根据 304 Not Modified 进行协商缓存

## TS 支持

Vite 天然支持 ts 文件，但仅执行转译，而不执行任何类型检查。后者建议独立进行（诸如 ESLint 等静态分析检查也是同理）

- 开发时如需更多 IDE 提示，建议在单独进程中运行`tsc --noEmit --watch`，若想在浏览器中直接看到上报的类型错误，可使用 vite-plugin-checker

- 构建生产版本时，可在 Vite 构建命令之外运行`tsc --noEmit`

<!-- 这部分有待验证和细化：“使用仅含类型的导入和导出 形式的语法可以避免潜在的 “仅含类型的导入被不正确打包” 的问题，写法示例如下” -->

<!-- TODO: Vite 与 TS 的配合选项仍待优化 -->

## JSX 支持

Vite 天然支持 jsx（tsx）文件，后者通过 esbuild 转译

- Vue 用户应使用官方的 @vitejs/plugin-vue-jsx 插件，由其提供 Vue 3 特性支持（HMR、全局组件解析、指令和插槽等）

<!-- - TODO: React 应是由 babel 提供的支持。有待细化 -->

- 其他库（如 Preact）的配置可参见 Vite 配置中的[esbuild 选项](https://cn.vitejs.dev/config/shared-options.html#esbuild)和[esbuild 文档](https://esbuild.github.io/content-types/#jsx)

## CSS 相关

css 文件可被直接导入，其内容将被插入至`<style>`标签，同时带 HMR 支持。`@import`内联也被支持。此外：

- PostCSS：若项目中包含有效 PostCSS 配置（参见[postcss-load-config](https://github.com/postcss/postcss-load-config)），则将自动应用于所有已导入的 CSS

- CSS 压缩：将在 PostCSS（如有）之后运行，相关配置`build.cssTarget`和`build.cssMinify`

- CSS Modules：以 .module.css 为后缀名的文件都被认为是一个 CSS modules 文件，基本用例[参见](https://cn.vitejs.dev/guide/features.html#css-modules)，相关配置`css.modules`

- CSS 预处理器：Vite 原则上建议仅使用原生 CSS 变量和实现 CSSWG 草案的 PostCSS 插件（如 [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)）来编写 CSS，但也同时提供了对 scss、sass、less、styl 和 stylus 文件的内置支持，无需特定的 Vite 插件，但须先安装相应的预处理器依赖。要点：

  - SFC 可通过诸如 `<style lang="sass">` 自动开启
  - Sass 和 Less 支持 @import，而 Stylus 不支持 <!-- TODO：以及别名 -->
  - 可通过在文件扩展名前加 .module 来结合使用 CSS modules

## 静态资源

导入一个静态资源将返回其解析后的路径，可使用基于根目录的绝对路径或相对路径。要点：

- CSS`url()`以及 Vue SFC 中的导入都将以相同方式处理

- 常见的图像、媒体及字体文件类型被自动检测为资源。可通过`assetsInclude`配置项扩展

- 较小的资源会被内联为 base64 data URL，可通过`assetsInlineLimit`项配置

- public 目录（默认`<root>/public`，可通过`publicDir`项配置）中的资源可直接通过`/`根路径导入，且构建后将被完整复制到目标目录的根目录下。适用于以下资源：

  - 不会被源码引用（如 robots.txt）
  - 须保持未经 hash 的原有文件名
  <!-- TODO: 了解下为什么 “public 中的资源不应该被 JavaScript 文件引用” -->

- 可利用现代浏览器原生提供的[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta)结合相对路径得到一个完整解析的静态资源 URL,如`const imgUrl = new URL('./img.png', import.meta.url).href`。且构建时 Vite 会进行必要转换以保证该 URL 在打包和资源哈希后指向正确<!-- TODO：最好验证下 Vite 构建时是否真的会处理利用 import.meta.url 引用资源的情况 -->。但注意：

  - 若该 URL 字符为非静态，则相关代码将原样保留。此时须考虑`build.target`不支持该 API 的情况

  - 无法在 SSR 中使用，该 API 在 Node 中有不同语义，服务端的产物也无法预先确定客户端主机 URL

<!-- TODO - 了解 Git LFS 后再解析这句话：“Git LFS 占位符会自动排除在内联之外，因为它们不包含它们所表示的文件的内容。要获得内联，请确保在构建之前通过 Git LFS 下载文件内容。” -->

<!-- TODO - 多了解 TS 及其与 Vite 结合使用的相关内容后再解析这句话：“默认情况下，TypeScript 不会将静态资源导入视为有效的模块。要解决这个问题，需要添加 vite/client” -->

资源导入方式可通过添加特殊查询参数更改：

- 显式加载资源为 URL，如：`import assetAsURL from './asset.js?url'`

- 以字符串形式加载资源，如：`import assetAsString from './shader.glsl?raw'`

- 加载为 Web Worker，如：`import Worker from './worker.js?worker'`

- 构建时将 Web Worker 内联为 base64 字符串：`import InlineWorker from './worker.js?worker&inline'`

## JSON

- 可直接整个导入，如：`import json from './example.json'`

- 也可指定**根字段**做具名导入（有助于 treeshaking），如：`import { field } from './example.json'`

---

根目录（root）：vite 将在此目录下查找配置文件（即 vite.config.js），同时源码中的绝对 URL 路径也将以此为基础来解析。**默认为当前工作目录**，也可以通过`vite serve [new-path]`来指定

## Glob 导入

`import.meta.glob` 函数用于导入模块集合，并以 key 遍历方式访问单个模块。匹配模块默认懒加载，构建时拆分为独立 chunk。例如：

```js
const lazyModules = import.meta.glob("./dir/*.js");
/**
将被 vite 转译为：
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js'),
}
因此可以如下形式访问
*/
for (const path in lazyModules) {
	lazyModules[path]().then((mod) => {
		console.log(path, mod);
	});
}
```

- 可指定 eager 选项以直接引入所有模块（如当此类模块中的副作用被首先执行时）。例如：

  ```js
  const modules = import.meta.glob("./dir/*.js", { eager: true });
  /** 
  将被 vite 转译为:
  import * as __glob__0_0 from './dir/foo.js'
  import * as __glob__0_1 from './dir/bar.js'
  const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1,
  }
  */
  ```

- 参数可为路径 pattern 数组，并支持反向匹配（以`!`为前缀）。例如：

  ```js
  // 若要排除 ./dir/bar.js
  const modules = import.meta.glob(["./dir/*.js", "!**/bar.js"]);
  ```

- 可用 import 选项指定具名导入项。与 eager 同时存在时支持模块 tree-shaking。例如：

  ```js
  const modules = import.meta.glob(
  	"./dir/*.js",
  	{ import: "setup" } // 设置为 "default" 则可加载默认导出
  );
  /** 
  将被 vite 转译为:
  const modules = {
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  }
  */
  ```

- 可用 query 选项在导入时携带查询参数（主要供其他插件使用）。例如：

  ```js
  const modules = import.meta.glob("./dir/*.js", {
  	query: { foo: "bar", bar: true },
  });
  /**
  将被 vite 转译为
  const modules = {
  './dir/foo.js': () => import('./dir/foo.js?foo=bar&bar=true'),
  './dir/bar.js': () => import('./dir/bar.js?foo=bar&bar=true'),
  }
  */
  ```

注意事项：

- pattern 只可为相对路径（`./`开头）、绝对路径（`/`开头，根目录解析）或别名路径（参见[resolve.alias](https://cn.vitejs.dev/config/shared-options.html#resolve-alias)）

- Glob 匹配以 fast-glob 实现， 其支持的 Glob 模式[参见](https://github.com/mrmlnc/fast-glob#pattern-syntax)

- pattern 路径只能为字面量，**不可以**使用任何变量或表达式

---

用于生产环境的构建包默认仅兼容支持原生 ESM 语法的现代浏览器。传统浏览器可通过官方插件 @vitejs/plugin-legacy 支持
