# React / Vue key 的作用

vue、react 都采用 diff 算法来对比新旧虚拟节点，从而更新

在 vue diff 函数的交叉对比中，当新、旧节点头尾交叉对比没有结果时，会根据新节点的 key 从旧节点数组中找相应节点（通过 key => index 的 Map 映射）：若未找到则认为是一个新增节点；而如果没有 key，则会采用遍历查找的方式去找对应的旧节点。相比而言，map 映射的速度更快，部分源码如下：

```js
// vue 项目 src/core/vdom/patch.js -line 488
// 以下为了阅读性而进行了格式化

// oldCh 是一个旧虚拟节点数组
if (isUndef(oldKeyToIdx)) {
	oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
}
if (idDef(newStartVnode.key)) {
	// map 方式获取
	idxInOld = oldKeyToIdx[newStartVnode.key];
} else {
	// 遍历方式获取
	idxInOld = findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
}

// 创建 Map 函数
function createKeyToOldIdx(children, beginIdx, endIdx) {
	let i, key;
	const map = {};
	for (i = beginIdx; i <= endIdx; ++i) {
		key = children[i].key;
		if (isDef(key)) map[key] = i;
	}
	return map;
}

// 遍历寻找
// sameVnode 是对比新旧节点是否相同的函数
function findIdxInOld(node, oldCh, start, end) {
	for (let i = start; i < end; i++) {
		const c = oldCh[i];
		if (isDef(c) && sameVnode(node, c)) return i;
	}
}
```

## 关于用 key 影响 diff 速度

有部分观点认为在没有 key 的情况下 diff 速度会更快。这种观点并没有错，未绑定 key 且在遍历模板较简单的情况下，新旧虚拟节点对比会更快，节点也会复用（就地复用，一种鸭子辩型的复用）。简单示例如下:

```html
<div id="app">
	<div v-for="i in dataList">{{ i }}</div>
</div>
```

```js
var vm = new Vue({
	el: "#app",
	data: {
		dataList: [1, 2, 3, 4, 5],
	},
});
```

以上，v-for 会生成以下的 dom 节点数组，我们给每一节点标记身份 id：

```js
[
	"<div>1</div>", // id： A
	"<div>2</div>", // id:  B
	"<div>3</div>", // id:  C
	"<div>4</div>", // id:  D
	"<div>5</div>", // id:  E
];
```

- 对 dataList 进行数据位置替换，对比：

  ```js
  vm.dataList = [4, 1, 3, 5, 2]; // 数据位置替换

  // 没有key的情况， 节点位置不变，但是节点innerText内容更新了
  [
  	"<div>4</div>", // id： A
  	"<div>1</div>", // id:  B
  	"<div>3</div>", // id:  C
  	"<div>5</div>", // id:  D
  	"<div>2</div>", // id:  E
  ];

  // 有key的情况，dom节点位置进行了交换，但是内容没有更新
  // <div v-for="i in dataList" :key='i'>{{ i }}</div>
  [
  	"<div>4</div>", // id： D
  	"<div>1</div>", // id:  A
  	"<div>3</div>", // id:  C
  	"<div>5</div>", // id:  E
  	"<div>2</div>", // id:  B
  ];
  ```

- 增删 dataList 项，对比：

```js
vm.dataList = [3, 4, 5, 6, 7]; // 数据进行增删

// 没有key的情况，节点位置不变，内容也更新了
[
	"<div>3</div>", // id： A
	"<div>4</div>", // id:  B
	"<div>5</div>", // id:  C
	"<div>6</div>", // id:  D
	"<div>7</div>", // id:  E
];

// 有key的情况，节点删除了 A, B 节点，新增了 F, G 节点
// <div v-for="i in dataList" :key='i'>{{ i }}</div>
[
	"<div>3</div>", // id： C
	"<div>4</div>", // id:  D
	"<div>5</div>", // id:  E
	"<div>6</div>", // id:  F
	"<div>7</div>", // id:  G
];
```

在使用简单模板的前提下，不带 key 可更有效复用节点（就地复用），diff 速度也更快，带 key 反而会在增删节点上有所耗时。此即 vue 文档所说的默认模式

但此模式也会带来一些隐藏的副作用，如可能不会产生过渡效果、或在某些节点有绑定数据（表单）时出现状态错位。vue 文档也有说明：_默认模式是高效的，但是只适用于不依赖子组件或临时 DOM(如表单输入值)状态的列表渲染输出_

而 key 的作用：key 给每个 vnode 唯一 id，依靠 key 可更准确更快拿到 oldVnode 中对应的 vnode

- 更准确：带 key 时则在 sameNode 函数 `a.key === b.key` 对比中避免了就地复用的情况，所以更加准确

- 更快：利用 key 的唯一性生成 Map 来获取对应节点，比遍历方式更快
