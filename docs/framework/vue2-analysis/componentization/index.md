# 组件化概述

Vue 另一核心思想为组件化，本章从源码角度分析后者的实现原理，例如以下代码（注意 render 函数中，createElement，即 h 的入参为组件而非原生标签）：

```js
import Vue from "vue";
import App from "./App.vue";

var app = new Vue({
	el: "#app",
	// 这里的 h 是 createElement 方法
	render: (h) => h(App),
});
```

## createComponent

自上章可知 createElement 最终会调用 \_createElement 函数，后者有段逻辑是判断 tag 参数：

- 若为内置标签则实例化为普通 VNode
- 否则调用 createComponent 函数创建组件 VNode

```js
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

本例传入的 App 即为组件配置对象，因而会执行 createComponent，定义于 src/core/vdom/create-component.js：

```js
// src/core/vdom/create-component.js
export function createComponent(
	Ctor: Class<Component> | Function | Object | void,
	data: ?VNodeData,
	context: Component,
	children: ?Array<VNode>,
	tag?: string
): VNode | Array<VNode> | void {
	if (isUndef(Ctor)) {
		return;
	}

	const baseCtor = context.$options._base;

	// plain options object: turn it into a constructor
	if (isObject(Ctor)) {
		Ctor = baseCtor.extend(Ctor);
	}

	// if at this stage it's not a constructor or an async component factory,
	// reject.
	if (typeof Ctor !== "function") {
		if (process.env.NODE_ENV !== "production") {
			warn(`Invalid Component definition: ${String(Ctor)}`, context);
		}
		return;
	}

	// async component
	let asyncFactory;
	if (isUndef(Ctor.cid)) {
		asyncFactory = Ctor;
		Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
		if (Ctor === undefined) {
			// return a placeholder node for async component, which is rendered
			// as a comment node but preserves all the raw information for the node.
			// the information will be used for async server-rendering and hydration.
			return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
		}
	}

	data = data || {};

	// resolve constructor options in case global mixins are applied after
	// component constructor creation
	resolveConstructorOptions(Ctor);

	// transform component v-model data into props & events
	if (isDef(data.model)) {
		transformModel(Ctor.options, data);
	}

	// extract props
	const propsData = extractPropsFromVNodeData(data, Ctor, tag);

	// functional component
	if (isTrue(Ctor.options.functional)) {
		return createFunctionalComponent(Ctor, propsData, data, context, children);
	}

	// extract listeners, since these needs to be treated as
	// child component listeners instead of DOM listeners
	const listeners = data.on;
	// replace with listeners with .native modifier
	// so it gets processed during parent component patch.
	data.on = data.nativeOn;

	if (isTrue(Ctor.options.abstract)) {
		// abstract components do not keep anything
		// other than props & listeners & slot

		// work around flow
		const slot = data.slot;
		data = {};
		if (slot) {
			data.slot = slot;
		}
	}

	// install component management hooks onto the placeholder node
	installComponentHooks(data);

	// return a placeholder vnode
	const name = Ctor.options.name || tag;
	const vnode = new VNode(
		`vue-component-${Ctor.cid}${name ? `-${name}` : ""}`,
		data,
		undefined,
		undefined,
		undefined,
		context,
		{ Ctor, propsData, listeners, tag, children },
		asyncFactory
	);

	// Weex specific: invoke recycle-list optimized @render function for
	// extracting cell-slot template.
	// https://github.com/Hanks10100/weex-native-directive/tree/master/component
	/* istanbul ignore if */
	if (__WEEX__ && isRecyclableComponent(vnode)) {
		return renderRecyclableComponentTemplate(vnode);
	}

	return vnode;
}
```

:::tip 提示
ctor 即 constructor 的缩写
:::

其核心流程分三个关键步骤：派生（组件）构造函数、安装钩子函数、实例化 VNode

### 派生构造函数

```js
const baseCtor = context.$options._base;

// plain options object: turn it into a constructor
if (isObject(Ctor)) {
	Ctor = baseCtor.extend(Ctor);
}
```

此处的 `context.$options._base` 即指向 Vue，相关逻辑位于 initGlobalAPI 函数（执行于初始化 Vue 阶段），定义于 `src/core/global-api/index.js` ：

```js
// this is used to identify the "base" constructor to extend all plain-object
// components with in Weex's multi-instance scenarios.
Vue.options._base = Vue;
```

而 `Vue.options` 又会在执行 `Vue.prototype._init` 时（定义于 `src/core/instance/init.js`）被扩展至 `vm.$options`，后者即 createComponent 中的 `context.$options`：

```js
// src/core/instance/init.js
vm.$options = mergeOptions(
	resolveConstructorOptions(vm.constructor),
	options || {},
	vm
);
```

mergeOptions（后面会分析其实现）将 Vue 的 options 与用户（在初始化 Vue 根实例和编写 Vue 组件时）传入的 options 做合并，再赋值给 `vm.$options`

总之 `baseCtor.extend` 即指向 `Vue.extend` 方法，定义于 `src/core/global-api/extend.js`

```js
// src/core/global-api/extend.js

/**
 * Class inheritance
 */
Vue.extend = function (extendOptions: Object): Function {
	extendOptions = extendOptions || {};
	const Super = this;
	const SuperId = Super.cid;
	const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
	if (cachedCtors[SuperId]) {
		return cachedCtors[SuperId];
	}

	const name = extendOptions.name || Super.options.name;
	if (process.env.NODE_ENV !== "production" && name) {
		validateComponentName(name);
	}

	const Sub = function VueComponent(options) {
		this._init(options);
	};
	Sub.prototype = Object.create(Super.prototype);
	Sub.prototype.constructor = Sub;
	Sub.cid = cid++;
	Sub.options = mergeOptions(Super.options, extendOptions);
	Sub["super"] = Super;

	// For props and computed properties, we define the proxy getters on
	// the Vue instances at extension time, on the extended prototype. This
	// avoids Object.defineProperty calls for each instance created.
	if (Sub.options.props) {
		initProps(Sub);
	}
	if (Sub.options.computed) {
		initComputed(Sub);
	}

	// allow further extension/mixin/plugin usage
	Sub.extend = Super.extend;
	Sub.mixin = Super.mixin;
	Sub.use = Super.use;

	// create asset registers, so extended classes
	// can have their private assets too.
	ASSET_TYPES.forEach(function (type) {
		Sub[type] = Super[type];
	});
	// enable recursive self-lookup
	if (name) {
		Sub.options.components[name] = Sub;
	}

	// keep a reference to the super options at extension time.
	// later at instantiation we can check if Super's options have
	// been updated.
	Sub.superOptions = Super.options;
	Sub.extendOptions = extendOptions;
	Sub.sealedOptions = extend({}, Sub.options);

	// cache constructor
	cachedCtors[SuperId] = Sub;
	return Sub;
};
```

实际开发中常通过创建 options 对象的形式编写 Vue 组件，而该方法即使用经典原型继承方式将前者转换为派生自 Vue 的构造函数 Sub（即组件构造函数），并且：

- 将 `Vue.options` 与 options 对象合并后赋值给 `Sub.options`
- 为 `Sub.options` 中的 props 和 computed 执行初始化逻辑
- 缓存 Sub，避免对同一组件做重复转换

当实例化 Sub 时，就会因执行 `this._init` 而再次执行 Vue 实例的初始化逻辑（实例化子组件的逻辑在之后的章节会介绍）

```js
const Sub = function VueComponent(options) {
	this._init(options);
};
```

### 安装组件钩子函数

```js
// install component management hooks onto the placeholder node
installComponentHooks(data);
```

之前提及 Vue Virtual DOM 所参考的开源库 snabbdom，它的一个特点是在 VNode 的 patch 流程中对外暴露了各种时机的钩子函数，方便做一些额外的事。Vue 也充分利用这一点，在初始化一个 Component 类型 VNode 的过程中实现了几个钩子函数：

```js
const componentVNodeHooks = {
	init(vnode: VNodeWithData, hydrating: boolean): ?boolean {
		if (
			vnode.componentInstance &&
			!vnode.componentInstance._isDestroyed &&
			vnode.data.keepAlive
		) {
			// kept-alive components, treat as a patch
			const mountedNode: any = vnode; // work around flow
			componentVNodeHooks.prepatch(mountedNode, mountedNode);
		} else {
			const child = (vnode.componentInstance = createComponentInstanceForVnode(
				vnode,
				activeInstance
			));
			child.$mount(hydrating ? vnode.elm : undefined, hydrating);
		}
	},

	prepatch(oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
		const options = vnode.componentOptions;
		const child = (vnode.componentInstance = oldVnode.componentInstance);
		updateChildComponent(
			child,
			options.propsData, // updated props
			options.listeners, // updated listeners
			vnode, // new parent vnode
			options.children // new children
		);
	},

	insert(vnode: MountedComponentVNode) {
		const { context, componentInstance } = vnode;
		if (!componentInstance._isMounted) {
			componentInstance._isMounted = true;
			callHook(componentInstance, "mounted");
		}
		if (vnode.data.keepAlive) {
			if (context._isMounted) {
				// vue-router#1212
				// During updates, a kept-alive component's child components may
				// change, so directly walking the tree here may call activated hooks
				// on incorrect children. Instead we push them into a queue which will
				// be processed after the whole patch process ended.
				queueActivatedComponent(componentInstance);
			} else {
				activateChildComponent(componentInstance, true /* direct */);
			}
		}
	},

	destroy(vnode: MountedComponentVNode) {
		const { componentInstance } = vnode;
		if (!componentInstance._isDestroyed) {
			if (!vnode.data.keepAlive) {
				componentInstance.$destroy();
			} else {
				deactivateChildComponent(componentInstance, true /* direct */);
			}
		}
	},
};

const hooksToMerge = Object.keys(componentVNodeHooks);

function installComponentHooks(data: VNodeData) {
	const hooks = data.hook || (data.hook = {});
	for (let i = 0; i < hooksToMerge.length; i++) {
		const key = hooksToMerge[i];
		const existing = hooks[key];
		const toMerge = componentVNodeHooks[key];
		if (existing !== toMerge && !(existing && existing._merged)) {
			hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge;
		}
	}
}

function mergeHook(f1: any, f2: any): Function {
	const merged = (a, b) => {
		// flow complains about extra args which is why we use any
		f1(a, b);
		f2(a, b);
	};
	merged._merged = true;
	return merged;
}
```

整个 installComponentHooks 的过程即把 componentVNodeHooks 的钩子函数合并到 `data.hook` 中，在 VNode 执行 patch 的过程中执行相关的钩子函数(具体执行会在介绍 patch 时详细介绍)

这里要注意的是合并策略，在合并过程中，若某个时机的钩子已存在于 data.hook 中，则通过执行 mergeHook 函数做合并，这个逻辑很简单，就是在最终执行时，依次执行这两个钩子函数即可

### 实例化 VNode

```js
const name = Ctor.options.name || tag;
const vnode = new VNode(
	`vue-component-${Ctor.cid}${name ? `-${name}` : ""}`,
	data,
	undefined,
	undefined,
	undefined,
	context,
	{ Ctor, propsData, listeners, tag, children },
	asyncFactory
);
return vnode;
```

最后一步即通过 new 实例化一个 VNode。注意与普通 VNode 不同，组件 VNode 不含 children（这点很关键，在之后的 patch 过程中会再提及）

至此分析完了 createComponent 的实现，后者返回了组件 VNode 且一样会走到 `vm._update` 方法，进而执行 patch 函数。前一章已对 patch 做了简单的分析，而下一节会对进一步分析

## 对 patch 的进一步分析

综合前述可知，createComponent 返回了组件 VNode 且一样会走到 `vm._update`，进而调用 `vm.__patch__` 并最终执行 patch 函数将 VNode 转换成真正的 DOM。下面针对组件 VNode 来详细分析

patch 过程会调用 createElm 创建元素节点，回顾下后者的实现，定义于 `src/core/vdom/patch.js`：

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
	// ...
	if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
		return;
	}
	// ...
}
```

只看关键逻辑，这里判断 `createComponent(vnode, insertedVnodeQueue, parentElm, refElm)` 的返回值，若为 true 则直接返回。createComponent 函数的实现如下：

```js
function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
	let i = vnode.data;
	if (isDef(i)) {
		const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
		if (isDef((i = i.hook)) && isDef((i = i.init))) {
			i(vnode, false /* hydrating */);
		}
		// after calling the init hook, if the vnode is a child component
		// it should've created a child instance and mounted it. the child
		// component also has set the placeholder vnode's elm.
		// in that case we can just return the element and be done.
		if (isDef(vnode.componentInstance)) {
			initComponent(vnode, insertedVnodeQueue);
			insert(parentElm, vnode.elm, refElm);
			if (isTrue(isReactivated)) {
				reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
			}
			return true;
		}
	}
}
```

其中首先对 `vnode.data` 做了一些判断：

```js
let i = vnode.data;
if (isDef(i)) {
	// ...
	if (isDef((i = i.hook)) && isDef((i = i.init))) {
		i(vnode, false /* hydrating */);
		// ...
	}
	// ..
}
```

若 vnode 为组件 VNode，则满足条件且得到的 i 即 init 钩子函数。在创建组件 VNode 时合并的钩子函数中即包含后者，定义于 `src/core/vdom/create-component.js`：

```js
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    // kept-alive components, treat as a patch
    const mountedNode: any = vnode // work around flow
    componentVNodeHooks.prepatch(mountedNode, mountedNode)
  } else {
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
},
```

init 钩子函数执行也很简单（先不考虑 keepAlive 的情况），通过 createComponentInstanceForVnode 创建一个 Vue 实例，再调用 $mount 方法挂载子组件。先看下 createComponentInstanceForVnode 的实现：

```js
export function createComponentInstanceForVnode(
	vnode: any, // we know it's MountedComponentVNode but flow doesn't
	parent: any // activeInstance in lifecycle state
): Component {
	const options: InternalComponentOptions = {
		_isComponent: true,
		_parentVnode: vnode,
		parent,
	};
	// check inline-template render functions
	const inlineTemplate = vnode.data.inlineTemplate;
	if (isDef(inlineTemplate)) {
		options.render = inlineTemplate.render;
		options.staticRenderFns = inlineTemplate.staticRenderFns;
	}
	return new vnode.componentOptions.Ctor(options);
}
```

该函数先构造一个内部组件的参数，再执行 `new vnode.componentOptions.Ctor(options)`，后者对应组件构造函数，即上节提及的 Vue 派生构造函数 Sub，相当于 `new Sub(options)`。几个关键点：

- \_isComponent 为 true 表示为一个组件
- parent 表示当前激活的组件实例（这里比较有意思的是如何拿到组件实例，后面会介绍）

所以组件实际上就是在此时被实例化的，且会执行 Vue 实例的 \_init 方法，该过程有些与之前不同的点需要挑出来说，代码位于 `src/core/instance/init.js`：

```js
Vue.prototype._init = function (options?: Object) {
	const vm: Component = this;
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
	// ...
	if (vm.$options.el) {
		vm.$mount(vm.$options.el);
	}
};
```

首先是合并 options 的过程有变化，\_isComponent 为 true，所以走到了 initInternalComponent 函数，简单看下后者的实现：

```js
export function initInternalComponent(
	vm: Component,
	options: InternalComponentOptions
) {
	const opts = (vm.$options = Object.create(vm.constructor.options));
	// doing this because it's faster than dynamic enumeration.
	const parentVnode = options._parentVnode;
	opts.parent = options.parent;
	opts._parentVnode = parentVnode;

	const vnodeComponentOptions = parentVnode.componentOptions;
	opts.propsData = vnodeComponentOptions.propsData;
	opts._parentListeners = vnodeComponentOptions.listeners;
	opts._renderChildren = vnodeComponentOptions.children;
	opts._componentTag = vnodeComponentOptions.tag;

	if (options.render) {
		opts.render = options.render;
		opts.staticRenderFns = options.staticRenderFns;
	}
}
```

该过程重点记住以下几点即可：

- `opts.parent = options.parent`
- `opts._parentVnode = parentVnode`

它们将之前 createComponentInstanceForVnode 函数的入参合并到内部选项 $options 中

再来看下 \_init 函数最后执行的代码：

```js
if (vm.$options.el) {
	vm.$mount(vm.$options.el);
}
```

由于组件初始化时无需 el，前者自己接管了 $mount 过程（主要流程在上一章介绍过了）

回到组件 init 过程，componentVNodeHooks 的 init 钩子函数，在完成实例化的 \_init 后，接着会执行 `child.$mount(hydrating ? vnode.elm : undefined, hydrating)` ：hydrating 为 true 一般对应服务端渲染，若只考虑客户端渲染则相当于执行 `child.$mount(undefined, false)`，它最终会触发 mountComponent 回调，进而调用 `vm._render()` 方法：

```js
Vue.prototype._render = function (): VNode {
	const vm: Component = this;
	const { render, _parentVnode } = vm.$options;

	// set parent vnode. this allows render functions to have access
	// to the data on the placeholder node.
	vm.$vnode = _parentVnode;
	// render self
	let vnode;
	try {
		vnode = render.call(vm._renderProxy, vm.$createElement);
	} catch (e) {
		// ...
	}
	// set parent
	vnode.parent = _parentVnode;
	return vnode;
};
```

只看关键代码，这里的 \_parentVnode 即当前组件的父 VNode，而 render 函数生成的为当前组件的渲染 VNode，后者的 parent 指向了 前者，即 `vm.$vnode`，它们是一种父子关系

在执行完 `vm._render` 生成 VNode 后，接着就要执行 `vm._update` 来渲染 VNode，后者定义于 `src/core/instance/lifecycle.js`。下面来看下组件渲染的过程中有哪些需要注意的：

```js
export let activeInstance: any = null;
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

几处关键逻辑：

- `vm._vnode = vnode`：该 vnode 即 `vm.\_render()` 返回的组件渲染 VNode，与 `vm.$vnode` 为父子关系，用代码表达即：`vm._vnode.parent === vm.$vnode`

- 还有这段代码：

  ```js
  export let activeInstance: any = null;
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  	// ...
  	const prevActiveInstance = activeInstance;
  	activeInstance = vm;
  	if (!prevVnode) {
  		// initial render
  		vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
  	} else {
  		// updates
  		vm.$el = vm.__patch__(prevVnode, vnode);
  	}
  	activeInstance = prevActiveInstance;
  	// ...
  };
  ```

  此处 activeInstance 作用是保持当前上下文的 Vue 实例，其为 lifecycle 模块的全局变量，并在之前调用 createComponentInstanceForVnode 函数时从该模块内获取，并且作为参数传入。由于 JS 单线程执行，Vue 的初始化即一个深度遍历的过程。在实例化组件过程中，需要知道当前上下文的 Vue 实例，并将其作为组件的父 Vue 实例

  之前提及组件的实例化过程先会调用 `initInternalComponent(vm, options)` 合并 options，将 parent 存储于 `vm.$options` 中，在 $mount 前会执行 `initLifecycle(vm)`，后者定义如下：

  ```js
  export function initLifecycle(vm: Component) {
  	const options = vm.$options;

  	// locate first non-abstract parent
  	let parent = options.parent;
  	if (parent && !options.abstract) {
  		while (parent.$options.abstract && parent.$parent) {
  			parent = parent.$parent;
  		}
  		parent.$children.push(vm);
  	}

  	vm.$parent = parent;
  	// ...
  }
  ```

  可看到 `vm.$parent` 就是用来保留当前 vm 的父实例，并通过 `parent.$children.push(vm)` 来将当前 vm 存储到后者的 $children 中

  在 `vm._update` 过程中，将当前 vm 赋值给 activeInstance，同时通过 `const prevActiveInstance = activeInstance` 用 prevActiveInstance 保留上一次的 activeInstance。实际上 prevActiveInstance 与当前 vm 是一个父子关系，当一个 vm 实例完成其所有子树的 patch 或 update 过程后，activeInstance 会回到它的父实例，这样就完美地保证了 createComponentInstanceForVnode 整个深度遍历过程中，在实例化组件时能传入当前子组件的父 Vue 实例。并在 \_init 的过程中，通过 `vm.$parent` 将该父子关系保留

那么回到 \_update，最后就是调用 **patch** 渲染 VNode 了

```js
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);

function patch(oldVnode, vnode, hydrating, removeOnly) {
	// ...
	let isInitialPatch = false;
	const insertedVnodeQueue = [];

	if (isUndef(oldVnode)) {
		// empty mount (likely as component), create new root element
		isInitialPatch = true;
		createElm(vnode, insertedVnodeQueue);
	} else {
		// ...
	}
	// ...
}
```

之前分析过 createElm 函数用于渲染 DOM，注意这里只有 2 个入参，第三个参数（parentElm）为 undefined。来看其定义：

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
	// ...
	if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
		return;
	}

	const data = vnode.data;
	const children = vnode.children;
	const tag = vnode.tag;
	if (isDef(tag)) {
		// ...

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

		// ...
	} else if (isTrue(vnode.isComment)) {
		vnode.elm = nodeOps.createComment(vnode.text);
		insert(parentElm, vnode.elm, refElm);
	} else {
		vnode.elm = nodeOps.createTextNode(vnode.text);
		insert(parentElm, vnode.elm, refElm);
	}
}
```

这里传入的 vnode 参数为组件 VNode，即 `vm._vnode`，<!-- 如果组件的根节点是个普通元素，那么 vm.\_vnode 也是普通的 vnode，这里 createComponent(vnode, insertedVnodeQueue, parentElm, refElm) 的返回值是 false。 -->接下来过程与上一章一样，先创建一个父节点占位符，再遍历所有子 VNode 递归调用 createElm，遍历过程中若遇到的子 VNode 为组件 VNode，则重复本节开始的过程。这样通过递归方式即可完整地构建了整个组件树

由于此时 parentElm 入参为 undefined，因而对于组件的插入在 createComponent 有如下逻辑：

```js
function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
	let i = vnode.data;
	if (isDef(i)) {
		// ....
		if (isDef((i = i.hook)) && isDef((i = i.init))) {
			i(vnode, false /* hydrating */);
		}
		// ...
		if (isDef(vnode.componentInstance)) {
			initComponent(vnode, insertedVnodeQueue);
			insert(parentElm, vnode.elm, refElm);
			if (isTrue(isReactivated)) {
				reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
			}
			return true;
		}
	}
}
```

在完成组件的整个 patch 过程后，最后执行 `insert(parentElm, vnode.elm, refElm)` 完成组件 DOM 的插入，若 patch 过程中又创建了子组件，则插入顺序为先子后父

总之组件 VNode 创建、初始化、渲染过程介绍完毕。接下来介绍其中的一些细节：编写组件实际即编写一个 JS 对象（通常），对象的描述即各种配置，之前提及 \_init 的最初阶段执行了合并 options 的逻辑，下面从源码角度来分析该过程
