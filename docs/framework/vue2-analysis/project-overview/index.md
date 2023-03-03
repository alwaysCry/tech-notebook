# 项目结构概览

## 源码目录设计

Vue 源码都在 src 目录下，其目录结构如下:

```
src
├── compiler        # 编译相关
├── core            # 核心代码
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 共享代码
```

- **compiler**：所有编译相关代码，包含将模板解析成 ast 语法树，ast 语法树优化，代码生成等功能

  编译工作既可在构建时（如借助 vue-loader），也可在运行时（使用含 Compiler 版本 Vue）。通常更推荐前者

- **core 目录**：Vue 核心代码，包括内置组件、全局 API 封装、Vue 实例化、观察者、虚拟 DOM、工具函数等

- **platform 目录**：Vue 是跨平台框架（web、weex）。platform 作为项目总入口，其子目录分别为 web 和 weex 平台 Vue 的打包入口

- **server 目录**：Vue2.0 支持服务端渲染，与此相关逻辑均在该目录下（此处代码运行于 Node.js）

  服务端渲染即把组件渲染为 HTML 字符串，并直接发送到浏览器。前者将"混合"为客户端上的应用程序

- **sfc 目录**：此目录下代码用于将 `.vue` 文件内容解析为 JS 对象

- **shared 目录**：定义一些工具方法，会被浏览器与服务端的 Vue 所共享

## 源码构建

Vue 源码基于 Rollup 构建，相关脚本均在 scripts 目录下。其 package.json 的 script 配置如下：

```js
{
  "script": {
    "build": "node scripts/build.js",
    "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer",
    "build:weex": "npm run build -- weex"
  }
}
```

当命令行执行 `npm run build` 时，实际执行的是 `node scripts/build.js`，其逻辑为：从配置文件读取配置，再通过命令行参数进行过滤（为构建出不同用途的 Vue）

```js
// scripts/build.js
let builds = require("./config").getAllBuilds();

// filter builds via command line arg
if (process.argv[2]) {
	const filters = process.argv[2].split(",");
	builds = builds.filter((b) => {
		return filters.some(
			(f) => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1
		);
	});
} else {
	// filter out weex builds by default
	builds = builds.filter((b) => {
		return b.output.file.indexOf("weex") === -1;
	});
}

build(builds);
```

而配置文件，在 `scripts/config.js` 中，如下：

```js
// scripts/config.js
const builds = {
	// Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
	"web-runtime-cjs": {
		entry: resolve("web/entry-runtime.js"),
		dest: resolve("dist/vue.runtime.common.js"),
		format: "cjs",
		banner,
	},
	// Runtime+compiler CommonJS build (CommonJS)
	"web-full-cjs": {
		entry: resolve("web/entry-runtime-with-compiler.js"),
		dest: resolve("dist/vue.common.js"),
		format: "cjs",
		alias: { he: "./entity-decoder" },
		banner,
	},
	// Runtime only (ES Modules). Used by bundlers that support ES Modules,
	// e.g. Rollup & Webpack 2
	"web-runtime-esm": {
		entry: resolve("web/entry-runtime.js"),
		dest: resolve("dist/vue.runtime.esm.js"),
		format: "es",
		banner,
	},
	// Runtime+compiler CommonJS build (ES Modules)
	"web-full-esm": {
		entry: resolve("web/entry-runtime-with-compiler.js"),
		dest: resolve("dist/vue.esm.js"),
		format: "es",
		alias: { he: "./entity-decoder" },
		banner,
	},
	// runtime-only build (Browser)
	"web-runtime-dev": {
		entry: resolve("web/entry-runtime.js"),
		dest: resolve("dist/vue.runtime.js"),
		format: "umd",
		env: "development",
		banner,
	},
	// runtime-only production build (Browser)
	"web-runtime-prod": {
		entry: resolve("web/entry-runtime.js"),
		dest: resolve("dist/vue.runtime.min.js"),
		format: "umd",
		env: "production",
		banner,
	},
	// Runtime+compiler development build (Browser)
	"web-full-dev": {
		entry: resolve("web/entry-runtime-with-compiler.js"),
		dest: resolve("dist/vue.js"),
		format: "umd",
		env: "development",
		alias: { he: "./entity-decoder" },
		banner,
	},
	// Runtime+compiler production build  (Browser)
	"web-full-prod": {
		entry: resolve("web/entry-runtime-with-compiler.js"),
		dest: resolve("dist/vue.min.js"),
		format: "umd",
		env: "production",
		alias: { he: "./entity-decoder" },
		banner,
	},
	// ...
};
```

以上为部分构建配置，其配置项解释如下：

- entry：构建入口 JS 路径
- dest：构建后的 JS 路径
- format：构建格式，其中 cjs 即 CommonJS，es 即 ES Module ...

以配置 `web-runtime-cjs`为例，其 entry 为 `resolve('web/entry-runtime.js')`，resolve 函数定义如下：

```js
// scripts/config.js
const aliases = require("./alias");
const resolve = (p) => {
	const base = p.split("/")[0];
	if (aliases[base]) {
		return path.resolve(aliases[base], p.slice(base.length + 1));
	} else {
		return path.resolve(__dirname, "../", p);
	}
};
```

将入参 `p` 按 `/` 分割为数组，取第一个元素为 base，即实参 `web/entry-runtime.js` 对应 base 为 web。后者为路径别名，别名配置代码如下：

```js
// scripts/alias
const path = require("path");

module.exports = {
	vue: path.resolve(
		__dirname,
		"../src/platforms/web/entry-runtime-with-compiler"
	),
	compiler: path.resolve(__dirname, "../src/compiler"),
	core: path.resolve(__dirname, "../src/core"),
	shared: path.resolve(__dirname, "../src/shared"),
	web: path.resolve(__dirname, "../src/platforms/web"),
	weex: path.resolve(__dirname, "../src/platforms/weex"),
	server: path.resolve(__dirname, "../src/server"),
	entries: path.resolve(__dirname, "../src/entries"),
	sfc: path.resolve(__dirname, "../src/sfc"),
};
```

所以 web 对应真实路径为 `path.resolve(__dirname, '../src/platforms/web')`

再通过 `path.resolve(aliases[base], p.slice(base.length + 1))` 即找到 web-runtime-cjs 配置对应入口文件：`/src/platforms/web/entry-runtime.js`
，经 Rollup 构建打包后，最终在 dist 目录下生成 `vue.runtime.common.js`

## Runtime Only VS Runtime + Compiler

Vue-cli 初始化项目时会询问使用 Runtime Only 还是 Runtime + Compiler 版本。以下做个对比：

- **Runtime Only**：只含运行时代码，更轻量。但需借助工具诸如 vue-loader 将模板预编译为 render 函数

- **Runtime + Compiler**：若未预编译代码，又有使用模板，则需此版本在运行时做编译

Vue2.0 最终通过 render 函数渲染。鉴于编译过程的性能损耗，通常不推荐在运行时编译

## 入口代码分析

这里分析 Runtime + Compiler 版本 Vue，其入口为 `src/platforms/web/entry-runtime-with-compiler.js`

当执行 `import Vue from 'vue'` 时，此处代码最先执行以初始化 Vue

```js{7}
/* @flow */

import config from "core/config";
import { warn, cached } from "core/util/index";
import { mark, measure } from "core/util/perf";

import Vue from "./runtime/index";
import { query } from "./util/index";
import { compileToFunctions } from "./compiler/index";
import {
	shouldDecodeNewlines,
	shouldDecodeNewlinesForHref,
} from "./util/compat";

const idToTemplate = cached((id) => {
	const el = query(id);
	return el && el.innerHTML;
});

const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (
	el?: string | Element,
	hydrating?: boolean
): Component {
	el = el && query(el);

	/* istanbul ignore if */
	if (el === document.body || el === document.documentElement) {
		process.env.NODE_ENV !== "production" &&
			warn(
				`Do not mount Vue to <html> or <body> - mount to normal elements instead.`
			);
		return this;
	}

	const options = this.$options;
	// resolve template/el and convert to render function
	if (!options.render) {
		let template = options.template;
		if (template) {
			if (typeof template === "string") {
				if (template.charAt(0) === "#") {
					template = idToTemplate(template);
					/* istanbul ignore if */
					if (process.env.NODE_ENV !== "production" && !template) {
						warn(
							`Template element not found or is empty: ${options.template}`,
							this
						);
					}
				}
			} else if (template.nodeType) {
				template = template.innerHTML;
			} else {
				if (process.env.NODE_ENV !== "production") {
					warn("invalid template option:" + template, this);
				}
				return this;
			}
		} else if (el) {
			template = getOuterHTML(el);
		}
		if (template) {
			/* istanbul ignore if */
			if (process.env.NODE_ENV !== "production" && config.performance && mark) {
				mark("compile");
			}

			const { render, staticRenderFns } = compileToFunctions(
				template,
				{
					shouldDecodeNewlines,
					shouldDecodeNewlinesForHref,
					delimiters: options.delimiters,
					comments: options.comments,
				},
				this
			);
			options.render = render;
			options.staticRenderFns = staticRenderFns;

			/* istanbul ignore if */
			if (process.env.NODE_ENV !== "production" && config.performance && mark) {
				mark("compile end");
				measure(`vue ${this._name} compile`, "compile", "compile end");
			}
		}
	}
	return mount.call(this, el, hydrating);
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
	if (el.outerHTML) {
		return el.outerHTML;
	} else {
		const container = document.createElement("div");
		container.appendChild(el.cloneNode(true));
		return container.innerHTML;
	}
}

Vue.compile = compileToFunctions;

export default Vue;
```

关键代码为 `import Vue from './runtime/index'` 即 Vue 的来源：

```js
// src/platforms/web/runtime/index.js
import Vue from "core/index";
import config from "core/config";
import { extend, noop } from "shared/util";
import { mountComponent } from "core/instance/lifecycle";
import { devtools, inBrowser, isChrome } from "core/util/index";

import {
	query,
	mustUseProp,
	isReservedTag,
	isReservedAttr,
	getTagNamespace,
	isUnknownElement,
} from "web/util/index";

import { patch } from "./patch";
import platformDirectives from "./directives/index";
import platformComponents from "./components/index";

// install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (
	el?: string | Element,
	hydrating?: boolean
): Component {
	el = el && inBrowser ? query(el) : undefined;
	return mountComponent(this, el, hydrating);
};

// ...

export default Vue;
```

关键代码为 `import Vue from 'core/index'`，即真正初始化 Vue 的地方为 `src/core/index.js`，之后逻辑都是对 Vue 对象做些扩展（可先不看）

```js
// src/core/index.js
import Vue from "./instance/index";
import { initGlobalAPI } from "./global-api/index";
import { isServerRendering } from "core/util/env";
import { FunctionalRenderContext } from "core/vdom/create-functional-component";

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, "$isServer", {
	get: isServerRendering,
});

Object.defineProperty(Vue.prototype, "$ssrContext", {
	get() {
		/* istanbul ignore next */
		return this.$vnode && this.$vnode.ssrContext;
	},
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, "FunctionalRenderContext", {
	value: FunctionalRenderContext,
});

Vue.version = "__VERSION__";

export default Vue;
```

2 处关键代码：

- `import Vue from './instance/index'`

  ```js
  // src/core/instance/index.js
  import { initMixin } from "./init";
  import { stateMixin } from "./state";
  import { renderMixin } from "./render";
  import { eventsMixin } from "./events";
  import { lifecycleMixin } from "./lifecycle";
  import { warn } from "../util/index";

  function Vue(options) {
  	if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
  		warn("Vue is a constructor and should be called with the `new` keyword");
  	}
  	this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  export default Vue;
  ```

  可见 Vue 实际为一个构造函数，只能用 new 实例化

  这里许多把 Vue 当参数传入的 xxxMixin 函数调用，其功能是在 Vue 的 prototype 上扩展一些方法（具体细节之后介绍）。这种把不同功能扩展到多模块去实现思路，有利于代码的维护管理

- `initGlobalAPI(Vue)`：用于为 Vue 添加全局静态方法，定义于 `src/core/global-api/index.js` ：

  ```js
  export function initGlobalAPI(Vue: GlobalAPI) {
  	// config
  	const configDef = {};
  	configDef.get = () => config;
  	if (process.env.NODE_ENV !== "production") {
  		configDef.set = () => {
  			warn(
  				"Do not replace the Vue.config object, set individual fields instead."
  			);
  		};
  	}
  	Object.defineProperty(Vue, "config", configDef);

  	// exposed util methods.
  	// NOTE: these are not considered part of the public API - avoid relying on
  	// them unless you are aware of the risk.
  	Vue.util = {
  		warn,
  		extend,
  		mergeOptions,
  		defineReactive,
  	};

  	Vue.set = set;
  	Vue.delete = del;
  	Vue.nextTick = nextTick;

  	Vue.options = Object.create(null);
  	ASSET_TYPES.forEach((type) => {
  		Vue.options[type + "s"] = Object.create(null);
  	});

  	// this is used to identify the "base" constructor to extend all plain-object
  	// components with in Weex's multi-instance scenarios.
  	Vue.options._base = Vue;

  	extend(Vue.options.components, builtInComponents);

  	initUse(Vue);
  	initMixin(Vue);
  	initExtend(Vue);
  	initAssetRegisters(Vue);
  }
  ```

  注意最好不要依赖 `Vue.util` 暴露的方法，后者可能常发生变化，并不稳定
