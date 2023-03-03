# 面试题解析之算法

## 介绍下深度优先遍历和广度优先遍历，如何实现？

### 深度优先遍历（DFS）

深度优先遍历（Depth-First-Search）与树的先序遍历比较类似

初始状态下图中所有顶点均未被访问，则从某个顶点 v 出发，依次从其各个邻接点出发遍历图，直至图中所有与 v 路径相通的顶点均被访问到；此时若尚有其他顶点未被访问到，则另选一个未被访问的顶点为起始点，重复上述过程。直至图中所有顶点均被访问到

```js
/* 深度优先遍历的三种方式 */
let deepTraversal1 = (node, nodeList = []) => {
	if (node !== null) {
		nodeList.push(node);
		let children = node.children;
		for (let i = 0; i < children.length; i++) {
			deepTraversal1(children[i], nodeList);
		}
	}
	return nodeList;
};

let deepTraversal2 = (node) => {
	let nodes = [];
	if (node !== null) {
		nodes.push(node);
		let children = node.children;
		for (let i = 0; i < children.length; i++) {
			nodes = nodes.concat(deepTraversal2(children[i]));
		}
	}
	return nodes;
};

let deepTraversal3 = (node) => {
	let stack = [];
	let nodes = [];
	if (node) {
		// 推入当前处理的 node
		stack.push(node);
		while (stack.length) {
			let item = stack.pop();
			let children = item.children;
			nodes.push(item);
			// 用反序是为了保证按从左到右的顺序遍历子节点，因为取节点用的 pop
			// 或改为 stack = stack.concat(children) ???
			for (let i = children.length - 1; i >= 0; i--) {
				stack.push(children[i]);
			}
		}
	}
};
```

### 广度优先遍历（BFS）

广度优先遍历（Breadth-First-Search）：从图中某顶点 v 出发，依次访问其各个**邻接点**，再从后者出发依次访问邻接点的邻接点，使得先访问顶点的邻接点早于后访问顶点的邻接点，直至图中所有已访问顶点的邻接点都被访问到。 若此时图中尚有顶点未被访问，则另选一个作为新的起始点，重复上述过程，直至图中所有顶点都被访问到

```js
let breadthTraversal = (node) => {
	let nodes = [];
	let stack = [];
	if (node) {
		stack.push(node);
		while (stack.length) {
			let item = stack.shift();
			let children = item.children;
			nodes.push(item);
			// 这里似乎正反序都可以
			for (let i = 0; i < children.length; i++) {
				stack.push(children[i]);
			}
		}
	}
};
```

## 算法手写题

已知如下数组，编写一个程序将数组扁平化去并除去其中重复部分数据，最终得到一个升序且不重复的数组：

```js
var arr = [[1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14]]]], 10];
```

解法：

```js
Array.from(new Set(arr.flat(Infinity))).sort((a, b) => a - b);
```

## 两个数组合并成一个数组

**题干**：请把两个数组

- `['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2']`
- `['A', 'B', 'C', 'D']`

合并为：`['A1', 'A2', 'A', 'B1', 'B2', 'B', 'C1', 'C2', 'C', 'D1', 'D2', 'D']`

**题解**

```js
const arrA = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"];
const arrB = ["A", "B", "C", "D"];
const arr = arrA.concat(arrB).sort((a, b) => {
	if (a.charCodeAt(0) < b.charCodeAt(0)) {
		return -1;
	} else if (a.length > b.length) {
		return -1;
	} else {
		return 0;
	}
});
```

## 冒泡排序如何实现，时间复杂度， 及如何改进？

```js
function bubbleSort(arr) {
	// 每轮循环依次将最大，第二大，第三大 移至右侧...
	for (let i = 0; i < arr.length; i++) {
		// 因此每轮子循环可将最大次数缩减 1, 2, 3 ...
		for (let j = 0; j < arr.length - i - 1; j++) {
			if (arr[j] > arr[j + 1]) {
				const temp = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = temp;
			}
		}
	}
	console.log(arr);
}

// 改进冒泡排序
function bubbleSort1(arr) {
	let i = arr.length - 1;
	while (i > 0) {
		let pos = 0;
		for (let j = 0; j < i; j++) {
			if (arr[j] > arr[j + 1]) {
				pos = j;
				const temp = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = temp;
			}
		}
		/*
    每轮子循环过后，pos 为该轮最后一次发生交换的位置，将作为下一轮的终点。其自身及其后的元素已完成从第N大到最大的排序，而无需参与下一轮子循环
     */
		i = pos;
	}
	console.log(arr);
}

// 补充
function bubbleSort2(arr) {
	let low = 0;
	let high = arr.length - 1;
	let temp, j;

	while (low < high) {
		// 正排找最大
		for (j = low; j < high; ++j) {
			if (arr[j] > arr[j + 1]) {
				temp = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = temp;
			}
		}
		--high;

		// 反排找最小
		for (j = high; j > low; --j) {
			if (arr[j] < arr[j - 1]) {
				temp = arr[j];
				arr[j] = arr[j - 1];
				arr[j - 1] = temp;
			}
		}
		++low;
	}
	console.log(arr);
}
```

其他排序算法还需补充 TODO

![](./assets/sort-algorithm.png)

## 将公司 1 到 12 月份销售额存在一个对象里

如将 `{1:222, 2:123, 5:888}` 的数据处理为此结构：  
`[222, 123, null, null, 888, null, null, null, null, null, null, null]`

```js
let obj = { 1: 222, 2: 123, 5: 888 };
const result = Array.from({ length: 12 }).map(
	(_, index) => obj[index + 1] || null
);
```

## 求两数组交集

如给定 `[1, 2, 2, 1]` 和 `[2, 2]`，返回 `[2, 2]`

两种思路：

- 空间换时间：将第数组一的元素按`值 - 出现次数`存于 Hash 表中（需遍历 n 次，以及一个 n 级别的空间）  
   再遍历数组二，若 Hash 表中存在对应 key 则将其存于 Result（数组）中，并将 其次数减 1（为 0 即删除）；若不存在则跳过。总体时间复杂度(m+n)

  ```js
  const intersect = (arr1, arr2) => {
  	const map = {};
  	const res = [];
  	for (let i of arr1) {
  		if (map[i]) {
  			map[i]++;
  		} else {
  			map[i] = 1;
  		}
  	}
  	for (let j of arr2) {
  		if (map[j] > 0) {
  			res.push(j);
  			map[j]--;
  		}
  	}
  	return res;
  };
  ```

- 提升时间复杂度：遍历的数组一时，判断值是否在数组二中：若在，便将该值 push 到 Result（数组）中，并将其从数组二中删除（用 splice）

## 数组算法题

随机生成长度 10 的整数数组，如 `[2, 10, 3, 4, 5, 11, 10, 11, 20]`，将其排列为新数组，要求形式为：`[[2, 3, 4, 5], [10, 11], [20]]`

实现思路参见[求连续区间](/interview/continuous-range)

```js
let arr = [2, 10, 3, 4, 5, 11, 10, 11, 20];
arr = Array.from(new Set(arr)).sort((a, b) => a - b);

const res = [];
let index = 0;
while (index < arr.length) {
	const range = [arr[index]];
	while (arr[index + 1] === arr[index] + 1) {
		range.push(arr[index + 1]);
		index++;
	}
	res.push(range);
	index++;
}

console.log(res);
```

## 字符串大小写取反（大写变小,小写变大）

例如 `'AbC'` 变成 `'aBc'`

```js
// 常规解法
function processString(s) {
	return s
		.split("")
		.map((i) => {
			return i === i.toUpperCase() ? i.toLowerCase() : i.toUpperCase();
		})
		.join("");
}

// 正则解法
function processString2(s) {
	return s.replace(/[a-zA-Z]/g, (c) => {
		return /[a-z]/.test(c) ? c.toUpperCase() : a.toLowerCase();
	});
}

// 位运算解法，只能用于纯英文字母组成的字符串
function processString3(s) {
	return s
		.split("")
		.map((c) => String.fromCharCode(c.charCodeAt(0) ^ 32))
		.join("");
}
```

## 实现字符串匹配算法

从长 n 的字符串 S 中，查找是否存在长度为 m 的字符串 T，若存在则返回所在位置

```js
const find = (S, T) => {
	if (S.length < T.length) return -1;
	for (let i = 0; i < S.length; i++) {
		if (S.slice(i, i + T.length) === T) return i;
	}
	return -1;
};
```

## 旋转数组

给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数

示例 1：

- 输入: [1, 2, 3, 4, 5, 6, 7] 和 k = 3
- 输出: [5, 6, 7, 1, 2, 3, 4]
- 解释:
  1. 向右旋转 1 步: [7, 1, 2, 3, 4, 5, 6]
  2. 向右旋转 2 步: [6, 7, 1, 2, 3, 4, 5]
  3. 向右旋转 3 步: [5, 6, 7, 1, 2, 3, 4]

示例 2：

- 输入: [-1, -100, 3, 99] 和 k = 2
- 输出: [3, 99, -1, -100]
- 解释:
  1. 向右旋转 1 步: [99, -1, -100, 3]
  2. 向右旋转 2 步: [3, 99, -1, -100]

```js
function rotate(arr, k) {
	const len = arr.length;
	const step = k % len; // 因为步数可能大于数组长度，所以要先取余
	return arr.slice(-step).concat(arr.slice(0, len - step));
}
```

## 找出 1 - 10000 之间的所有对称数

例如 121、1331 等

```js
// 思路一：逐一遍历，reverse 判断是否相等
Array.from({ length: 10000 })
	.map((_, index) => index + 1)
	.filter((x) => {
		const s = x.toString();
		return s.length > 1 && x === Number(s.split("").reverse().join(""));
	});

// 思路二：10000 内的对称数只可能有 AA、ABA、ABBA 三种形式
const symmetricNums = [];
for (let i = 1; i < 10; i++) {
	symmetricNums.push(i * 11); // AA
	for (let j = 0; i < 10; j++) {
		symmetricNums.push(i * 101 + j * 10); // ABA
		symmetricNums.push(i * 1001 + j * 110); // ABBA
	}
}
```

## 数组移动零

编写一个函数将给定数组中所有 0 移动到末尾，同时保持非零元素的相对顺序。示例：

- 输入: [0,1,0,3,12]
- 输出: [1,3,12,0,0]

说明：

- 须在原数组上操作，不得额外拷贝数组
- 尽量减少操作次数

**题解**：

`splice()` 方法可移除数组中现有元素，还可同时添加新元素，并将**被移除元素**以数组形式返回。此方法会改变原数组

`Array.prototype.splice(start[, deleteCount][, item1, item2, ...])`

- start：修改的起始位置（从 0 开始）
  - 若超出数组长度，则从其末尾开始
  - 若为负值，则从末位开始计数（-n 即倒数第 n 个元素）
  - 若为负数，且绝对值超出数组长度，则从头开始（第 0 位）
- deleteCount（可选）：整数，表示**要移除**的元素个数
  - 若大于 start 后元素总数或省略该参数（undefined），则从 start（含）后所有元素都会移除
  - 若为 0 或负数，则不移除元素而是添加（至少要传入一个 item）
- item1, item2, ... (可选)
  - 待**添加进**的元素，从 start 位置开始

```js
function zeroMove(array) {
	let len = array.length;
	let j = 0;
	for (let i = 0; i < len - j; i++) {
		if (array[i] === 0) {
			array.push(0);
			array.splice(i, 1);
			i--;
			j++;
		}
	}
	return array;
}
```

## 两数之和

找出整数数组中和为目标值的两个数（假设只有一种答案，且同样元素不能重复利用）。示例：

- 给定 `nums = [2, 7, 11, 15], target = 9`
- 返回 `[0, 1]`，因为 `nums[0] + nums[1] = 2 + 7 = 9`

```js
// 常规思路
function twoNumForSum(nums, sum) {
	for (let i = 0; i < nums.length - 1; i++) {
		for (let j = i + 1; j < nums.length; j++) {
			if (nums[i] + nums[j] === sum) {
				return [i, j];
			}
		}
	}
}

// 空间换时间
function twoNumForSum2(nums, sum) {
	const map = new Map(nums.map((n, index) => [n, index]));
	for (let i = 0; i < nums.length; i++) {
		const diff = sum - nums[i];
		const j = map.get(diff);
		if (j && j !== i) {
			return [i, j];
		}
	}
}
```

## list 转树形

尽可能降低时间复杂度

```js
// 原始 list 如下
let list = [
	{ id: 1, name: "部门A", parentId: 0 },
	{ id: 2, name: "部门B", parentId: 0 },
	{ id: 3, name: "部门C", parentId: 1 },
	{ id: 4, name: "部门D", parentId: 1 },
	{ id: 5, name: "部门E", parentId: 2 },
	{ id: 6, name: "部门F", parentId: 3 },
	{ id: 7, name: "部门G", parentId: 2 },
	{ id: 8, name: "部门H", parentId: 4 },
];

// 转换后的结果如下
let result = [
    {
      id: 1,
      name: '部门A',
      parentId: 0,
      children: [
        {
          id: 3,
          name: '部门C',
          parentId: 1,
          children: [
            {
              id: 6,
              name: '部门F',
              parentId: 3
            }, {
              id: 16,
              name: '部门L',
              parentId: 3
            }
          ]
        },
        {
          id: 4,
          name: '部门D',
          parentId: 1,
          children: [
            {
              id: 8,
              name: '部门H',
              parentId: 4
            }
          ]
        }
      ]
    },
  ···
];

// 解法
function convert(list) {
  const map = new Map(list.map(node => [node.id, node]))
  const roots = []

  for (let i = 0; i< list.length; i++) {
    const node = list[i]
    if (node.parentId === 0) {
      roots.push(node)
      continue
    }
    const parent = map.get(node.parentId)
    if (!parent) continue
    if (!parent.children) {
      parent.children = [node]
      continue
    }
    parent.children.push(node)
  }

  return roots
}

```

## 找出链条中的所有父级

```js
/*
  示例数据：
  输入 112 ，输出 [1, 11, 112]
*/
const data = [
	{
		id: "1",
		name: "广东省",
		children: [
			{
				id: "10",
				name: "广州市",
				children: [
					{ id: "101", name: "天河区" },
					{ id: "102", name: "花都区" },
				],
			},
			{
				id: "11",
				name: "深圳市",
				children: [
					{
						id: "111",
						name: "南山区",
						children: [{ id: "1111", name: "南山必胜客" }],
					},
					{ id: "112", name: "福田区" },
				],
			},
		],
	},
];

// 递归函数的关键在于函数的出口
// 自己写的 dfs 解法
function search(id, node /* 若不存在根节点则虚拟一个 */) {
	let arr = node.id ? [node.id] : [];
	// 已找到目标 id，返回之
	if (node.id === id) return arr;
	// 未找到目标 id 且已在叶子节点
	if (node.id !== id && !node.children) return [];
	// 遍历子节点，进入下一层递归。返回非空数组意味着在其后续路径中已找到目标id
	for (let i = 0; i < node.children.length; i++) {
		let chain = search(id, node.children[i]);
		if (chain.length) return arr.concat(chain);
	}
	// 执行至此意味着后续路径中均无目标id
	return [];
}

// 来自 lhyt 的解法
// bfs 用队列实现，push 进 shift 出
function bfs(roots, id) {
	const queue = JSON.parse(JSON.stringify(roots)); // 为方便测试，以免影响数据
	while (queue.length) {
		const current = queue.shift();
		current.chain = (current.chain || []).concat([current.id]);
		if (current.id === id) {
			return current.chain;
		}
		if (!current.children) {
			continue;
		}
		current.children.forEach((child) => {
			// 此处必然是（子）节点第一次被处理
			child.chain = current.chain;
			// 别忘了 push
			queue.push(child);
		});
	}
	return [];
}

// dfs 用栈实现，push 进 pop 出
function dfs(roots, id) {
	const stack = JSON.parse(JSON.stringify(roots));
	while (stack.length) {
		const current = stack.pop();
		current.chain = (current.chain || []).concat([chain.id]);
		if (current.id === id) {
			return current.chain;
		}
		if (!current.children) {
			continue;
		}
		// 先左后右
		current.children.reverse().forEach((child) => {
			child.chain = current.chain;
			queue.push(child);
		});
	}
	return [];
}
```

## 给定两个有序数组，找出二者合并后的中位数

要求算法时间复杂度为：`O(log(m+n))`，示例：

```
nums1 = [1, 3]
nums2 = [2]
// 中位数为 2

nums1 = [1, 2]
nums2 = [3, 4]
// 中位数为 (2+3)/2 = 2.5
```

解析：由于给定有序数组，因而可参考归并排序原理，排到中位数长度即可

```js
// TODO：需要兼容数组存在反序的情况
function findMedian(nums1, nums2) {
	const len1 = nums1.length;
	const len2 = nums2.length;
	const median = Math.ceil((len1 + len2 + 1) / 2);
	const isOddLen = (len1 + len2) % 2 !== 0;
	const result = new Array(median);

	let i = 0; // pointer for nums1
	let j = 0; // pointer for nums2

	for (let k = 0; k < median; k++) {
		if (i < len1 && j < len2) {
			if (nums1[i] < nums2[j]) {
				result[i + j] = nums1[i++];
			} else {
				result[i + j] = nums2[j++];
			}
		} else if (i < len1) {
			result[i + j] = nums1[i++];
		} else if (j < len2) {
			result[i + j] = nums2[j++];
		}
	}

	if (isOddLen) {
		return result[median - 1];
	} else {
		return (result[median - 1] + result[median - 2]) / 2;
	}
}
```
