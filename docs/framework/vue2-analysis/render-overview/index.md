# 渲染流程概述

Vue 核心思想是数据驱动，视图由数据驱动生成，无需直接操作 DOM。相比传统前端库（如 jQuery），大大简化了代码量。尤其当交互复杂时，只关心数据会让代码逻辑清晰，也利于维护

本章介绍 Vue 将模板渲染为 DOM 的过程

:::tip 提示
vm 即 viewModel，可指代 Vue 根实例或 Vue 组件实例
:::

## `new Vue` 发生了什么

相关源码：

```js
// src/core/instance/index.js
function Vue(options) {
	if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
		warn("Vue is a constructor and should be called with the `new` keyword");
	}
	this._init(options);
}
```

Vue 只能通过 new 关键字初始化其实例，然后调用 `this._init`，定义于 `src/core/instance/init.js`

```js
// src/core/instance/init.js
Vue.prototype._init = function (options?: Object) {
	const vm: Component = this;
	// a uid
	vm._uid = uid++;

	let startTag, endTag;
	/* istanbul ignore if */
	if (process.env.NODE_ENV !== "production" && config.performance && mark) {
		startTag = `vue-perf-start:${vm._uid}`;
		endTag = `vue-perf-end:${vm._uid}`;
		mark(startTag);
	}

	// a flag to avoid this being observed
	vm._isVue = true;
	// merge options
	if (options && options._isComponent) {
		// optimize internal component instantiation
		// since dynamic options merging is pretty slow, and none of the
		// internal component options needs special treatment.
		initInternalComponent(vm, options);
	} else {
		vm.$options = mergeOptions(
			resolveConstructorOptions(vm.constructor),
			options || {},
			vm
		);
	}
	/* istanbul ignore else */
	if (process.env.NODE_ENV !== "production") {
		initProxy(vm);
	} else {
		vm._renderProxy = vm;
	}
	// expose real self
	vm._self = vm;
	initLifecycle(vm);
	initEvents(vm);
	initRender(vm);
	callHook(vm, "beforeCreate");
	initInjections(vm); // resolve injections before data/props
	initState(vm);
	initProvide(vm); // resolve provide after data/props
	callHook(vm, "created");

	/* istanbul ignore if */
	if (process.env.NODE_ENV !== "production" && config.performance && mark) {
		vm._name = formatComponentName(vm, false);
		mark(endTag);
		measure(`vue ${vm._name} init`, startTag, endTag);
	}

	if (vm.$options.el) {
		vm.$mount(vm.$options.el);
	}
};
```

可见 Vue 的初始化流程：合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等（...这些逻辑稍后介绍）

初始化的最后，检测到若有 el 属性则调用 `vm.$mount` 挂载。以下分析 Vue 的挂载过程

## Vue 实例挂载的实现

Vue 通过实例方法 $mount 来挂载 vm。该方法的实现与平台、构建方式相关，在多个文件都有定义，如：

- `src/platform/web/entry-runtime-with-compiler.js`
- `src/platform/web/runtime/index.js`
- `src/platform/weex/runtime/index.js`

下面重点分析带 compiler 版本的 $mount 实现。定义于 `src/platform/web/entry-runtime-with-compiler.js` ：

```js
// src/platform/web/entry-runtime-with-compiler.js
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
```

先缓存原型上的 $mount 方法再重新定义，大致逻辑：

1. 校验 el，Vue 不能挂载在 body、html 这样的根节点上
2. 若未定义 render 方法，则通过 compileToFunctions 函数将 el 或 template 转换为前者（关键步骤）
3. 最后调用原来的 $mount 方法挂载

原来的 $mount 方法定义于 `src/platform/web/runtime/index.js`，会在 runtime only 版本中直接调用（先缓存再重写是为了复用），定义如下：

```js
// public mount method
Vue.prototype.$mount = function (
	el?: string | Element,
	hydrating?: boolean
): Component {
	el = el && inBrowser ? query(el) : undefined;
	return mountComponent(this, el, hydrating);
};
```

支持参数：

- **el**：挂载目标的元素，可为选择器字符串或 DOM
- **hydrating** 是否服务端渲染

该方法实际又调用了 mountComponent 函数，定义于 `src/core/instance/lifecycle.js`：

```js
// src/core/instance/lifecycle.js
export function mountComponent(
	vm: Component,
	el: ?Element,
	hydrating?: boolean
): Component {
	vm.$el = el;
	if (!vm.$options.render) {
		vm.$options.render = createEmptyVNode;
		if (process.env.NODE_ENV !== "production") {
			/* istanbul ignore if */
			if (
				(vm.$options.template && vm.$options.template.charAt(0) !== "#") ||
				vm.$options.el ||
				el
			) {
				warn(
					"You are using the runtime-only build of Vue where the template " +
						"compiler is not available. Either pre-compile the templates into " +
						"render functions, or use the compiler-included build.",
					vm
				);
			} else {
				warn(
					"Failed to mount component: template or render function not defined.",
					vm
				);
			}
		}
	}
	callHook(vm, "beforeMount");

	let updateComponent;
	/* istanbul ignore if */
	if (process.env.NODE_ENV !== "production" && config.performance && mark) {
		updateComponent = () => {
			const name = vm._name;
			const id = vm._uid;
			const startTag = `vue-perf-start:${id}`;
			const endTag = `vue-perf-end:${id}`;

			mark(startTag);
			const vnode = vm._render();
			mark(endTag);
			measure(`vue ${name} render`, startTag, endTag);

			mark(startTag);
			vm._update(vnode, hydrating);
			mark(endTag);
			measure(`vue ${name} patch`, startTag, endTag);
		};
	} else {
		updateComponent = () => {
			vm._update(vm._render(), hydrating);
		};
	}

	// we set this to vm._watcher inside the watcher's constructor
	// since the watcher's initial patch may call $forceUpdate (e.g. inside child
	// component's mounted hook), which relies on vm._watcher being already defined
	new Watcher(
		vm,
		updateComponent,
		noop,
		{
			before() {
				if (vm._isMounted) {
					callHook(vm, "beforeUpdate");
				}
			},
		},
		true /* isRenderWatcher */
	);
	hydrating = false;

	// manually mounted instance, call mounted on self
	// mounted is called for render-created child components in its inserted hook
	if (vm.$vnode == null) {
		vm._isMounted = true;
		callHook(vm, "mounted");
	}
	return vm;
}
```

mountComponent 会完成整个渲染工作：

1. 首先实例化渲染 Watcher，后者会在以下时机执行回调 updateComponent：

   - 初始化时
   - vm 监测的数据变化时（后面介绍）

   updateComponent 会调用 `vm._render` 方法先生成虚拟 Node，再调用 `vm._update` 更新 DOM

2. 最后若 `vm.$vnode`（即 Vue 实例的父虚拟 Node）为 null（表示当前为根实例），则设置 `vm._isMounted` 为 true，表示该实例已被挂载，同时执行 mounted 钩子函数

接下重点分析最核心的 2 个方法：`vm._render` 和 `vm._update`

## render

Vue 实例的 `_render` 方法用于生成虚拟 Node，定义于 `src/core/instance/render.js`：

```js
// src/core/instance/render.js
Vue.prototype._render = function (): VNode {
	const vm: Component = this;
	const { render, _parentVnode } = vm.$options;

	// reset _rendered flag on slots for duplicate slot check
	if (process.env.NODE_ENV !== "production") {
		for (const key in vm.$slots) {
			// $flow-disable-line
			vm.$slots[key]._rendered = false;
		}
	}

	if (_parentVnode) {
		vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject;
	}

	// set parent vnode. this allows render functions to have access
	// to the data on the placeholder node.
	vm.$vnode = _parentVnode;
	// render self
	let vnode;
	try {
		vnode = render.call(vm._renderProxy, vm.$createElement);
	} catch (e) {
		handleError(e, vm, `render`);
		// return error render result,
		// or previous vnode to prevent render error causing blank component
		/* istanbul ignore else */
		if (process.env.NODE_ENV !== "production") {
			if (vm.$options.renderError) {
				try {
					vnode = vm.$options.renderError.call(
						vm._renderProxy,
						vm.$createElement,
						e
					);
				} catch (e) {
					handleError(e, vm, `renderError`);
					vnode = vm._vnode;
				}
			} else {
				vnode = vm._vnode;
			}
		} else {
			vnode = vm._vnode;
		}
	}
	// return empty vnode in case the render function errored out
	if (!(vnode instanceof VNode)) {
		if (process.env.NODE_ENV !== "production" && Array.isArray(vnode)) {
			warn(
				"Multiple root nodes returned from render function. Render function " +
					"should return a single root node.",
				vm
			);
		}
		vnode = createEmptyVNode();
	}
	// set parent
	vnode.parent = _parentVnode;
	return vnode;
};
```

以上代码的关键点在 render 函数的调用：

（若使用 template 开发，也会在先前 $mount 方法中将其编译成 render，之后会专门分析）

```js
vnode = render.call(vm._renderProxy, vm.$createElement);
```

可见，render 函数中的入参 createElement 即 `vm.$createElement` 方法，后者实际上在 initRender 函数中被定义

```js
export function initRender(vm: Component) {
	// ...
	// bind the createElement fn to this instance
	// so that we get proper render context inside it.
	// args order: tag, data, children, normalizationType, alwaysNormalize
	// internal version is used by render functions compiled from templates
	vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);
	// normalization is always applied for the public version, used in
	// user-written render functions.
	vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);
}
```

可见除 `vm.$createElement` 外还有以一个 `vm._c` 方法，后者将作为模板编译成的 render 函数的入参。二者支持的参数相同，且内部都调用了 createElement 函数

总之 `vm._render` 最终通过执行 createElement 函数返回虚拟 Node（即 vnode）。以下介绍 Virtual DOM 的概念

## Virtual DOM

真正的 DOM 对象非常庞大，频繁更新会产生一定的性能问题

而 Virtual DOM 用原生 JS 对象来描述 DOM，比创建真实 DOM 的代价要小很多。在 Vue 中，Virtual DOM 用 VNode 这个 Class 来描述，定义于 `src/core/vdom/vnode.js`

```js
// src/core/vdom/vnode.js
export default class VNode {
	tag: string | void;
	data: VNodeData | void;
	children: ?Array<VNode>;
	text: string | void;
	elm: Node | void;
	ns: string | void;
	context: Component | void; // rendered in this component's scope
	key: string | number | void;
	componentOptions: VNodeComponentOptions | void;
	componentInstance: Component | void; // component instance
	parent: VNode | void; // component placeholder node

	// strictly internal
	raw: boolean; // contains raw HTML? (server only)
	isStatic: boolean; // hoisted static node
	isRootInsert: boolean; // necessary for enter transition check
	isComment: boolean; // empty comment placeholder?
	isCloned: boolean; // is a cloned node?
	isOnce: boolean; // is a v-once node?
	asyncFactory: Function | void; // async component factory function
	asyncMeta: Object | void;
	isAsyncPlaceholder: boolean;
	ssrContext: Object | void;
	fnContext: Component | void; // real context vm for functional nodes
	fnOptions: ?ComponentOptions; // for SSR caching
	fnScopeId: ?string; // functional scope id support

	constructor(
		tag?: string,
		data?: VNodeData,
		children?: ?Array<VNode>,
		text?: string,
		elm?: Node,
		context?: Component,
		componentOptions?: VNodeComponentOptions,
		asyncFactory?: Function
	) {
		this.tag = tag;
		this.data = data;
		this.children = children;
		this.text = text;
		this.elm = elm;
		this.ns = undefined;
		this.context = context;
		this.fnContext = undefined;
		this.fnOptions = undefined;
		this.fnScopeId = undefined;
		this.key = data && data.key;
		this.componentOptions = componentOptions;
		this.componentInstance = undefined;
		this.parent = undefined;
		this.raw = false;
		this.isStatic = false;
		this.isRootInsert = true;
		this.isComment = false;
		this.isCloned = false;
		this.isOnce = false;
		this.asyncFactory = asyncFactory;
		this.asyncMeta = undefined;
		this.isAsyncPlaceholder = false;
	}

	// DEPRECATED: alias for componentInstance for backwards compat.
	/* istanbul ignore next */
	get child(): Component | void {
		return this.componentInstance;
	}
}
```

由于包含了许多独有特性，Vue 的 Virtual DOM 定义略显复杂。后者实际借鉴并扩展了开源库 snabbdom，想深入了解不妨先阅读该库源码（更简单纯粹）

总之 Virtual DOM 是对真实 DOM 的一种抽象描述，核心在于几个关键属性：标签名、数据、子节点、键值等，而其它属性都用于扩展其灵活性以及实现一些特殊功能。由于其只用于映射真实 DOM，无需包含操作后者的方法，因此通常非常轻量简单

VNode 映射到真实的 DOM 实际要经历 create、diff、patch 等过程。其中的 create 即 createElement 函数，下面分析其实现

## createElement

Vue 通过 createElement 方法创建 VNode，定义于 `src/core/vdom/create-element.js` 中：

```js
// src/core/vdom/create-element.js

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement(
	context: Component,
	tag: any,
	data: any,
	children: any,
	normalizationType: any,
	alwaysNormalize: boolean
): VNode | Array<VNode> {
	if (Array.isArray(data) || isPrimitive(data)) {
		normalizationType = children;
		children = data;
		data = undefined;
	}
	if (isTrue(alwaysNormalize)) {
		normalizationType = ALWAYS_NORMALIZE;
	}
	return _createElement(context, tag, data, children, normalizationType);
}
```

该函数实际是对 \_createElement 函数的包装，以允许更灵活的入参。后者真正创建了 VNode

```js
export function _createElement(
	context: Component,
	tag?: string | Class<Component> | Function | Object,
	data?: VNodeData,
	children?: any,
	normalizationType?: number
): VNode | Array<VNode> {
	if (isDef(data) && isDef((data: any).__ob__)) {
		process.env.NODE_ENV !== "production" &&
			warn(
				`Avoid using observed data object as vnode data: ${JSON.stringify(
					data
				)}\n` + "Always create fresh vnode data objects in each render!",
				context
			);
		return createEmptyVNode();
	}
	// object syntax in v-bind
	if (isDef(data) && isDef(data.is)) {
		tag = data.is;
	}
	if (!tag) {
		// in case of component :is set to falsy value
		return createEmptyVNode();
	}
	// warn against non-primitive key
	if (
		process.env.NODE_ENV !== "production" &&
		isDef(data) &&
		isDef(data.key) &&
		!isPrimitive(data.key)
	) {
		if (!__WEEX__ || !("@binding" in data.key)) {
			warn(
				"Avoid using non-primitive value as key, " +
					"use string/number value instead.",
				context
			);
		}
	}
	// support single function children as default scoped slot
	if (Array.isArray(children) && typeof children[0] === "function") {
		data = data || {};
		data.scopedSlots = { default: children[0] };
		children.length = 0;
	}
	if (normalizationType === ALWAYS_NORMALIZE) {
		children = normalizeChildren(children);
	} else if (normalizationType === SIMPLE_NORMALIZE) {
		children = simpleNormalizeChildren(children);
	}
	let vnode, ns;
	if (typeof tag === "string") {
		let Ctor;
		ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
		if (config.isReservedTag(tag)) {
			// platform built-in elements
			vnode = new VNode(
				config.parsePlatformTagName(tag),
				data,
				children,
				undefined,
				undefined,
				context
			);
		} else if (
			isDef((Ctor = resolveAsset(context.$options, "components", tag)))
		) {
			// component
			vnode = createComponent(Ctor, data, context, children, tag);
		} else {
			// unknown or unlisted namespaced elements
			// check at runtime because it may get assigned a namespace when its
			// parent normalizes children
			vnode = new VNode(tag, data, children, undefined, undefined, context);
		}
	} else {
		// direct component options / constructor
		vnode = createComponent(tag, data, context, children);
	}
	if (Array.isArray(vnode)) {
		return vnode;
	} else if (isDef(vnode)) {
		if (isDef(ns)) applyNS(vnode, ns);
		if (isDef(data)) registerDeepBindings(data);
		return vnode;
	} else {
		return createEmptyVNode();
	}
}
```

\_createElement 函数支持 5 个参数：

- context：VNode 的上下文环境，Component 类型
- tag：标签，可为字符串或 Component
- data：VNode 的数据，VNodeData 类型，定义于 `flow/vnode.js`
- children：当前 VNode 的子节点，任意类型，会被规范为标准 VNode 数组
- normalizationType：子节点的规范类型，不同类型有不同的规范方法，主要是参考 render 函数由编译生成还是用户手写

此函数流程略多，下面主要分析两个重点：children 的规范化和 VNode 的创建

## children 的规范化

由于 Virtual DOM 实际为树状结构，每个 VNode 均可能有若干子节点，后者也应是 VNode 类型。而 \_createElement 的 children 参数可为任意类型，需先将其规范化

这里根据 normalizationType 不同，会调用 `normalizeChildren(children)` 或 `simpleNormalizeChildren(children)` 。二者均定义于 `src/core/vdom/helpers/normalzie-children.js`：

```js
// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
export function simpleNormalizeChildren(children: any) {
	for (let i = 0; i < children.length; i++) {
		if (Array.isArray(children[i])) {
			return Array.prototype.concat.apply([], children);
		}
	}
	return children;
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
export function normalizeChildren(children: any): ?Array<VNode> {
	return isPrimitive(children)
		? [createTextVNode(children)]
		: Array.isArray(children)
		? normalizeArrayChildren(children)
		: undefined;
}
```

- 调用 simpleNormalizeChildren 的场景：render 函数由编译产生。理论上此时的 children 都已为 VNode 类型。唯一例外为函数式组件，后者返回一个数组而非一个根节点，所以会通过 `Array.prototype.concat` 将整个 children 数组打平

- normalizeChildren 的调用场景：

  - render 函数由用户手写。Vue 允许在 children 中只有一个子节点时将前者定义为 JS 基础类型，此时会调用 createTextVNode 创建一个文本节点 VNode

  - 当 slot、v-for 产生嵌套数组时。此时会调用 normalizeArrayChildren 函数，下面看其实现：

```js
function normalizeArrayChildren(
	children: any,
	nestedIndex?: string
): Array<VNode> {
	const res = [];
	let i, c, lastIndex, last;
	for (i = 0; i < children.length; i++) {
		c = children[i];
		if (isUndef(c) || typeof c === "boolean") continue;
		lastIndex = res.length - 1;
		last = res[lastIndex];
		//  nested
		if (Array.isArray(c)) {
			if (c.length > 0) {
				c = normalizeArrayChildren(c, `${nestedIndex || ""}_${i}`);
				// merge adjacent text nodes
				if (isTextNode(c[0]) && isTextNode(last)) {
					res[lastIndex] = createTextVNode(last.text + (c[0]: any).text);
					c.shift();
				}
				res.push.apply(res, c);
			}
		} else if (isPrimitive(c)) {
			if (isTextNode(last)) {
				// merge adjacent text nodes
				// this is necessary for SSR hydration because text nodes are
				// essentially merged when rendered to HTML strings
				res[lastIndex] = createTextVNode(last.text + c);
			} else if (c !== "") {
				// convert primitive to vnode
				res.push(createTextVNode(c));
			}
		} else {
			if (isTextNode(c) && isTextNode(last)) {
				// merge adjacent text nodes
				res[lastIndex] = createTextVNode(last.text + c.text);
			} else {
				// default key for nested array children (likely generated by v-for)
				if (
					isTrue(children._isVList) &&
					isDef(c.tag) &&
					isUndef(c.key) &&
					isDef(nestedIndex)
				) {
					c.key = `__vlist${nestedIndex}_${i}__`;
				}
				res.push(c);
			}
		}
	}
	return res;
}
```

该函数接收 2 个参数：

- children 表示要规范的子节点数组
- nestedIndex 表示嵌套的层级

其主要逻辑即遍历 children，获得单个节点 c 并判断其类型：

- 若为数组，则递归调用自身，nestedIndex 用于在此作为嵌套 child 的 key 的层级前缀
- 若为 JS 基础类型，则用 createTextVNode 方法转换成 VNode 类型
- 否则是 VNode 类型

若在遍历时遇到多个连续的 text 节点，会把它们合并为一个。经规范化后，children 变为标准 VNode 数组

## VNode 的创建

回到 createElement 函数，规范化 children 后，接着即创建 VNode 实例：

```js
let vnode, ns;
if (typeof tag === "string") {
	let Ctor;
	ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
	if (config.isReservedTag(tag)) {
		// platform built-in elements
		vnode = new VNode(
			config.parsePlatformTagName(tag),
			data,
			children,
			undefined,
			undefined,
			context
		);
	} else if (
		isDef((Ctor = resolveAsset(context.$options, "components", tag)))
	) {
		// component
		vnode = createComponent(Ctor, data, context, children, tag);
	} else {
		// unknown or unlisted namespaced elements
		// check at runtime because it may get assigned a namespace when its
		// parent normalizes children
		vnode = new VNode(tag, data, children, undefined, undefined, context);
	}
} else {
	// direct component options / constructor
	vnode = createComponent(tag, data, context, children);
}
```

先判断 tag：

- 若为 string，则判断其是否为内置节点
  - 若是，则创建一个普通 VNode
  - 若为已注册组件名，则调用 createComponent 创建一个组件类型 VNode
  - 否则创建一个未知标签的 VNode
- 若为 Component 类型，则直接调用 createComponent 创建一个组件类型 VNode

（createComponent 函数会在之后介绍，本质上其还是返回了一个 VNode）

以上即 createElement 创建 VNode 的大致过程。每个 VNode 有 children，其中的元素同样是 VNode，这样就形成一个 VNode Tree（很好地描述了 DOM Tree）

回到 mountComponent 函数，在 vm.\_render 返回 VNode 后，接着就通过 vm.\_update 将其渲染为一个真实 DOM。下面来做分析

## update

Vue 实例的 \_update 方法会在以下时机被调用：

- 首次渲染
- 数据更新时

这里只分析前者，后者会在分析响应式原理时涉及

该方法用于将 VNode 渲染为真实的 DOM，定义于 `src/core/instance/lifecycle.js`：

```js
// src/core/instance/lifecycle.js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
	const vm: Component = this;
	const prevEl = vm.$el;
	const prevVnode = vm._vnode;
	const prevActiveInstance = activeInstance;
	activeInstance = vm;
	vm._vnode = vnode;
	// Vue.prototype.__patch__ is injected in entry points
	// based on the rendering backend used.
	if (!prevVnode) {
		// initial render
		vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
	} else {
		// updates
		vm.$el = vm.__patch__(prevVnode, vnode);
	}
	activeInstance = prevActiveInstance;
	// update __vue__ reference
	if (prevEl) {
		prevEl.__vue__ = null;
	}
	if (vm.$el) {
		vm.$el.__vue__ = vm;
	}
	// if parent is an HOC, update its $el as well
	if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
		vm.$parent.$el = vm.$el;
	}
	// updated hook is called by the scheduler to ensure that children are
	// updated in a parent's updated hook.
};
```

其核心为 `vm.__patch__` 方法，后者在不同平台（如 web 和 weex） 有各自相应的实现，web 平台实现定义于 `src/platforms/web/runtime/index.js` ：

```js
Vue.prototype.__patch__ = inBrowser ? patch : noop;
```

另外，是否服务端渲染也会对该方法产生影响。服务端渲染时并无 DOM 环境，因而无需将 VNode 转换成 DOM，因此为空函数；而在浏览器中，其指向 patch 函数，定义于 `src/platforms/web/runtime/patch.js`：

```js
import * as nodeOps from "web/runtime/node-ops";
import { createPatchFunction } from "core/vdom/patch";
import baseModules from "core/vdom/modules/index";
import platformModules from "web/runtime/modules/index";

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules);

export const patch: Function = createPatchFunction({ nodeOps, modules });
```

该函数实际为 createPatchFunction 函数的返回值，后者在调用接受对象入参，包含以下属性：

- nodeOps：封装了一系列 DOM 操作的方法
- modules：定义了一些模块的钩子函数的实现，

这里暂不展开介绍。先看 createPatchFunction 的实现，定义于 `src/core/vdom/patch.js`：

```js
const hooks = ["create", "activate", "update", "remove", "destroy"];

export function createPatchFunction(backend) {
	let i, j;
	const cbs = {};

	const { modules, nodeOps } = backend;

	for (i = 0; i < hooks.length; ++i) {
		cbs[hooks[i]] = [];
		for (j = 0; j < modules.length; ++j) {
			if (isDef(modules[j][hooks[i]])) {
				cbs[hooks[i]].push(modules[j][hooks[i]]);
			}
		}
	}

	// ...

	return function patch(oldVnode, vnode, hydrating, removeOnly) {
		if (isUndef(vnode)) {
			if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
			return;
		}

		let isInitialPatch = false;
		const insertedVnodeQueue = [];

		if (isUndef(oldVnode)) {
			// empty mount (likely as component), create new root element
			isInitialPatch = true;
			createElm(vnode, insertedVnodeQueue);
		} else {
			const isRealElement = isDef(oldVnode.nodeType);
			if (!isRealElement && sameVnode(oldVnode, vnode)) {
				// patch existing root node
				patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
			} else {
				if (isRealElement) {
					// mounting to a real element
					// check if this is server-rendered content and if we can perform
					// a successful hydration.
					if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
						oldVnode.removeAttribute(SSR_ATTR);
						hydrating = true;
					}
					if (isTrue(hydrating)) {
						if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
							invokeInsertHook(vnode, insertedVnodeQueue, true);
							return oldVnode;
						} else if (process.env.NODE_ENV !== "production") {
							warn(
								"The client-side rendered virtual DOM tree is not matching " +
									"server-rendered content. This is likely caused by incorrect " +
									"HTML markup, for example nesting block-level elements inside " +
									"<p>, or missing <tbody>. Bailing hydration and performing " +
									"full client-side render."
							);
						}
					}
					// either not server-rendered, or hydration failed.
					// create an empty node and replace it
					oldVnode = emptyNodeAt(oldVnode);
				}

				// replacing existing element
				const oldElm = oldVnode.elm;
				const parentElm = nodeOps.parentNode(oldElm);

				// create new node
				createElm(
					vnode,
					insertedVnodeQueue,
					// extremely rare edge case: do not insert if old element is in a
					// leaving transition. Only happens when combining transition +
					// keep-alive + HOCs. (#4590)
					oldElm._leaveCb ? null : parentElm,
					nodeOps.nextSibling(oldElm)
				);

				// update parent placeholder node element, recursively
				if (isDef(vnode.parent)) {
					let ancestor = vnode.parent;
					const patchable = isPatchable(vnode);
					while (ancestor) {
						for (let i = 0; i < cbs.destroy.length; ++i) {
							cbs.destroy[i](ancestor);
						}
						ancestor.elm = vnode.elm;
						if (patchable) {
							for (let i = 0; i < cbs.create.length; ++i) {
								cbs.create[i](emptyNode, ancestor);
							}
							// #6513
							// invoke insert hooks that may have been merged by create hooks.
							// e.g. for directives that uses the "inserted" hook.
							const insert = ancestor.data.hook.insert;
							if (insert.merged) {
								// start at index 1 to avoid re-invoking component mounted hook
								for (let i = 1; i < insert.fns.length; i++) {
									insert.fns[i]();
								}
							}
						} else {
							registerRef(ancestor);
						}
						ancestor = ancestor.parent;
					}
				}

				// destroy old node
				if (isDef(parentElm)) {
					removeVnodes(parentElm, [oldVnode], 0, 0);
				} else if (isDef(oldVnode.tag)) {
					invokeDestroyHook(oldVnode);
				}
			}
		}

		invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
		return vnode.elm;
	};
}
```

该函数内部定义了一系列辅助方法，最终返回的 patch 函数

进一步介绍前可思考下为何 Vue 源码要将相关代码分散到各个目录：前面介绍过 patch 是平台相关的，Web 和 Weex 环境下将 vnode 映射为平台 DOM 的方法不同，DOM 包含属性模块的创建和更新也不同，所以每个平台会有各自的 nodeOps 和 modules（相关代码托管在 `src/platforms` 目录下）

但不同平台 patch 函数的主体逻辑相同（这部分托管在 `src/core` 目录下），差异化部分可通过参数来体现

因而这里用到函数柯里化技巧，即通过 createPatchFunction 将差异化参数提前固化，而非每次调用 patch 时都传递 nodeOps 和 modules

这里 nodeOps 表示对 “平台 DOM” 的一些操作方法，modules 表示平台的一些模块，后者会在 patch 过程的不同阶段执行相应的钩子函数。这部分会在之后具体介绍

回到 patch 方法本身，其接收 4 个参数：

- oldVnode：旧 VNode，也可不存在或为一个 DOM 对象
- vnode：新生成的 VNode
- hydrating：是否为服务端渲染
- removeOnly：用于 transition-group（之后介绍）

patch 逻辑相对复杂，有许多分支。这里仅针对首次渲染的场景（其它场景之后再回顾），例子如下

```js
var app = new Vue({
	el: "#app",
	render: function (createElement) {
		return createElement(
			"div",
			{
				attrs: {
					id: "app",
				},
			},
			this.message
		);
	},
	data: {
		message: "Hello Vue!",
	},
});
```

此时 `vm._update` 方法会以如下形式调用 `vm.__patch__`：

```js
// initial render
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
```

由于是首次渲染，oldVnode 参数即对应上例中的 `div#app`，后者在 mountComponent 函数内被赋值给 `vm.$el`

再回到 patch 函数的执行过程，有几个关键步骤：

```js
const isRealElement = isDef(oldVnode.nodeType);
if (!isRealElement && sameVnode(oldVnode, vnode)) {
	// patch existing root node
	patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
} else {
	if (isRealElement) {
		// mounting to a real element
		// check if this is server-rendered content and if we can perform
		// a successful hydration.
		if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
			oldVnode.removeAttribute(SSR_ATTR);
			hydrating = true;
		}
		if (isTrue(hydrating)) {
			if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
				invokeInsertHook(vnode, insertedVnodeQueue, true);
				return oldVnode;
			} else if (process.env.NODE_ENV !== "production") {
				warn(
					"The client-side rendered virtual DOM tree is not matching " +
						"server-rendered content. This is likely caused by incorrect " +
						"HTML markup, for example nesting block-level elements inside " +
						"<p>, or missing <tbody>. Bailing hydration and performing " +
						"full client-side render."
				);
			}
		}
		// either not server-rendered, or hydration failed.
		// create an empty node and replace it
		oldVnode = emptyNodeAt(oldVnode);
	}

	// replacing existing element
	const oldElm = oldVnode.elm;
	const parentElm = nodeOps.parentNode(oldElm);

	// create new node
	createElm(
		vnode,
		insertedVnodeQueue,
		// extremely rare edge case: do not insert if old element is in a
		// leaving transition. Only happens when combining transition +
		// keep-alive + HOCs. (#4590)
		oldElm._leaveCb ? null : parentElm,
		nodeOps.nextSibling(oldElm)
	);
}
```

由于 oldVnode 为 DOM 对象，因而 isRealElement 为 true，并通过 emptyNodeAt 函数将前者转换为空的 VNode（即无子节点）。再调用 createElm 函数，其具体实现如下：

```js
function createElm(
	vnode,
	insertedVnodeQueue,
	parentElm,
	refElm,
	nested,
	ownerArray,
	index
) {
	if (isDef(vnode.elm) && isDef(ownerArray)) {
		// This vnode was used in a previous render!
		// now it's used as a new node, overwriting its elm would cause
		// potential patch errors down the road when it's used as an insertion
		// reference node. Instead, we clone the node on-demand before creating
		// associated DOM element for it.
		vnode = ownerArray[index] = cloneVNode(vnode);
	}

	vnode.isRootInsert = !nested; // for transition enter check
	if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
		return;
	}

	const data = vnode.data;
	const children = vnode.children;
	const tag = vnode.tag;
	if (isDef(tag)) {
		if (process.env.NODE_ENV !== "production") {
			if (data && data.pre) {
				creatingElmInVPre++;
			}
			if (isUnknownElement(vnode, creatingElmInVPre)) {
				warn(
					"Unknown custom element: <" +
						tag +
						"> - did you " +
						"register the component correctly? For recursive components, " +
						'make sure to provide the "name" option.',
					vnode.context
				);
			}
		}

		vnode.elm = vnode.ns
			? nodeOps.createElementNS(vnode.ns, tag)
			: nodeOps.createElement(tag, vnode);
		setScope(vnode);

		/* istanbul ignore if */
		if (__WEEX__) {
			// ...
		} else {
			createChildren(vnode, children, insertedVnodeQueue);
			if (isDef(data)) {
				invokeCreateHooks(vnode, insertedVnodeQueue);
			}
			insert(parentElm, vnode.elm, refElm);
		}

		if (process.env.NODE_ENV !== "production" && data && data.pre) {
			creatingElmInVPre--;
		}
	} else if (isTrue(vnode.isComment)) {
		vnode.elm = nodeOps.createComment(vnode.text);
		insert(parentElm, vnode.elm, refElm);
	} else {
		vnode.elm = nodeOps.createTextNode(vnode.text);
		insert(parentElm, vnode.elm, refElm);
	}
}
```

该函数会根据虚拟节点创建真实 DOM 并插入到其父节点中，关键逻辑：

- 调用 createComponent （之后详细介绍）的目的是尝试创建子组件，当前场景下返回 false
- 接着判断 vnode 是否包含 tag，若包含则简单校验其合法性（非生产环境下），再调用平台 DOM 方法创建占位符元素 `vnode.elm`

```js
vnode.elm = vnode.ns
	? nodeOps.createElementNS(vnode.ns, tag)
	: nodeOps.createElement(tag, vnode);
```

再调用 createChildren 函数创建子元素：

```js
createChildren(vnode, children, insertedVnodeQueue);

function createChildren(vnode, children, insertedVnodeQueue) {
	if (Array.isArray(children)) {
		if (process.env.NODE_ENV !== "production") {
			checkDuplicateKeys(children);
		}
		for (let i = 0; i < children.length; ++i) {
			createElm(
				children[i],
				insertedVnodeQueue,
				vnode.elm,
				null,
				true,
				children,
				i
			);
		}
	} else if (isPrimitive(vnode.text)) {
		nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
	}
}
```

该方法遍历子虚拟节点，递归调用 createElm 并传入 `vnode.elm` 作为父 DOM 元素占位符

接着调用 invokeCreateHooks 函数执行所有的 create 钩子并将 vnode push 到 insertedVnodeQueue 中

```js
if (isDef(data)) {
	invokeCreateHooks(vnode, insertedVnodeQueue);
}

function invokeCreateHooks(vnode, insertedVnodeQueue) {
	for (let i = 0; i < cbs.create.length; ++i) {
		cbs.create[i](emptyNode, vnode);
	}
	i = vnode.data.hook; // Reuse variable
	if (isDef(i)) {
		if (isDef(i.create)) i.create(emptyNode, vnode);
		if (isDef(i.insert)) insertedVnodeQueue.push(vnode);
	}
}
```

最后调用 insert 函数将 DOM 插入到父元素中，定义于 `src/core/vdom/patch.js`

（由于按深度优先，所以 DOM 元素的插入顺序是先子后父，也是因此需要父 DOM 节点占位符）

```js
insert(parentElm, vnode.elm, refElm);

function insert(parent, elm, ref) {
	if (isDef(parent)) {
		if (isDef(ref)) {
			if (ref.parentNode === parent) {
				nodeOps.insertBefore(parent, elm, ref);
			}
		} else {
			nodeOps.appendChild(parent, elm);
		}
	}
}
```

其逻辑即调用 nodeOps 的对象方法将子元素插入到父元素中，这些方法定义于 `src/platforms/web/runtime/node-ops.js`（本质就是调用原生 API 进行 DOM 操作）

```js
export function insertBefore(
	parentNode: Node,
	newNode: Node,
	referenceNode: Node
) {
	parentNode.insertBefore(newNode, referenceNode);
}

export function appendChild(node: Node, child: Node) {
	node.appendChild(child);
}
```

createElm 过程中，若 vnode 不含 tag 则说明其可能为注释或纯文本节点，可直接插入到父元素中。本例的最内层就是一个文本 vnode，其 text 值为 `this.message` 的值 `Hello Vue!`

再回到 patch 方法，本例中调用 createElm 时传入的 parentElm 是 `oldVnode.elm` 的父元素，即 `div#app` 的父元素（Body）。整个过程实际就是递归创建了一个完整 DOM 树并插入到 Body 中

最后根据递归 createElm 时 vnode 插入队列的顺序（先子后父？）执行相关的 insert 钩子函数（之后详细介绍）

至此模板（或 render）渲染成最终 DOM 的主线过程分析完毕（最基础场景），可用下图直观表示：

![](./assets/new-vue.png)
