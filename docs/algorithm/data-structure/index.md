# 数据解构

## 链表（Linked List）

常见的有单向/环形（即首尾相连）/双向链表

- 缺点：访问结点效率低、占用内存多

- 优点：插入/删除结点效率高，时间复杂度$O(1)$，总体较数组稳定（部分语言须考虑扩容）

```js
class Node {
	val;
	next;
	constructor(val, next) {
		this.val = val === undefined ? 0 : val;
		this.next = next === undefined ? 0 : next;
	}
}

class DualNode {
	val;
	next;
	constructor(val, next) {
		this.val = val === undefined ? 0 : val;
		this.next = next === undefined ? 0 : next;
		this.prev = prev === undefined ? null : prev;
	}
}

/* 结点 n0 后插入结点 P */
function insert(n0, p) {
	let n1 = n0.next;
	n0.next = p;
	p.next = n1;
}

/* 删除结点 n0 后的首个结点 */
function remove(n0) {
	if (!n0.next) return;
	let n1 = n0.next.next;
	n0.next = n1;
}

/* 访问索引为 index 的结点 */
function access(head, index) {
	for (let i = 0; i < index; i++) {
		if (!head) return null;
		head = head.next;
	}
	return head;
}

/* 查找值为 target 的首个结点，并输出其索引 */
function find(head, target) {
	let index = 0;
	while (head !== null) {
		if (head.val === target) {
			return index;
		}
		head = head.next;
		index += 1;
	}
	return -1;
}
```

## 列表（List）

可被理解为变长数组或动态数组，可在运行中实时扩容。其（简单）实现须关注三个核心点：

- 合理的初始容量`initialCapacity`

- 数量`size`用于记录当前元素个数，随元素插入/删除实时更新，以判断是否需扩容

- 扩容机制，当元素可能超出容量时，根据扩容倍数`extendRatio`建立更大数组替换当前数组

```js
class MyList {
	#nums = new Array();
	#capacity = 10;
	#size = 0;
	#extendRatio = 2;

	constructor() {
		this.#nums = new Array(this.#capacity);
	}

	size() {
		return this.#size;
	}

	capacity() {
		return this.#capacity;
	}

	get(index) {
		// 索引越界则抛出异常
		if (index < 0 || index >= this.#size)
			throw new Error("index out of bounds");
		return this.#nums[index];
	}

	set(index, num) {
		if (index < 0 || index >= this.#size)
			throw new Error("index out of bounds");
		this.#nums[index] = num;
	}

	/* 尾部添加 */
	add(num) {
		if (this.#size === this.#capacity) {
			this.extendCapacity();
		}
		this.#nums[this.#size] = num;
		this.#size++;
	}

	/* 中间插入 */
	insert(index, num) {
		if (index < 0 || index >= this.#size)
			throw new Error("index out of bounds");
		if (this.#size === this.#capacity) {
			this.extendCapacity();
		}
		// 将索引 index 以及之后的元素都后移一位
		for (let j = this.#size - 1; j >= index; j--) {
			this.#nums[j + 1] = this.#nums[j];
		}
		this.#nums[index] = num;
		this.#size++;
	}

	remove(index) {
		if (index < 0 || index >= this.#size)
			throw new Error("index out of bounds");
		const num = this.#nums[index];
		// 将索引index之后的元素都前移一位
		for (let j = index; j < this.#size - 1; j++) {
			this.#nums[j] = this.#nums[j + 1];
		}
		this.#size--;
		return num;
	}

	extendCapacity() {
		this.#nums = this.#nums.concat(
			new Array(this.capacity() * (this.#extendRatio - 1))
		);
		this.#capacity = this.#nums.length;
	}

	toArray() {
		let size = this.size();
		const nums = new Array(size);
		for (let i = 0; i < size; i++) {
			nums[i] = this.get(i);
		}
		return nums;
	}
}
```

## 栈（Stack）

遵循先入后出（first in, last out）的线性数据结构。其顶部称为**栈顶**，底部称为**栈底**，添加元素到栈顶称为**入栈**，删除栈顶元素称为**出栈**

```js
/* 基于链表实现 */
class LinkedListStack {
	#top = null; // 栈顶
	#stackSize = 0; // 栈长

	get size() {
		return this.#stackSize;
	}

	isEmpty() {
		return this.size === 0;
	}

	peek() {
		if (!this.#top) throw new Error("empty stack");
		return this.#top.val;
	}

	push(num) {
		// ListNode 类参见上文
		const node = new Node(num);
		node.next = this.#top;
		this.#top = node;
		this.#stackSize++;
	}

	pop() {
		const num = this.peek();
		this.#top = this.#top.next;
		this.#stackSize--;
		return num;
	}

	toArray() {
		let node = this.#top;
		const res = new Array(this.size);
		for (let i = res.length - 1; i >= 0; i--) {
			res[i] = node.val;
			node = node.next;
		}
		return res;
	}
}

/* 基于数组实现 */
class ArrayStack {
	stack = [];

	get size() {
		return this.stack.length;
	}

	empty() {
		return this.stack.length === 0;
	}

	peek() {
		if (this.empty()) throw new Error("empty stack");
		return this.stack[this.stack.length - 1];
	}

	push(num) {
		this.stack.push(num);
	}

	pop() {
		if (this.empty()) throw new Error("empty stack");
		return this.stack.pop();
	}

	toArray() {
		return this.stack;
	}
}
```

## 队列（Queue）

遵循先入先出（first in, first out）的线性数据结构。其头部称为**队头**，尾部称为**队尾**，**从队尾加入元素**称为**入队**，**删除队头元素**称为**出队**

```js
/* 链表实现队列 */
class LinkedListQueue {
	#front = null;
	#rear = null;
	#queueSize = 0;

	get size() {
		return this.#queueSize;
	}

	isEmpty() {
		return this.size === 0;
	}

	peek() {
		if (this.size === 0) throw new Error("empty queue");
		return this.#front.val;
	}

	push(val) {
		const node = new Node(val);
		// 若队列为空，则首、尾均指向node
		if (!this.#front) {
			this.#front = node;
			this.#rear = node;
		} else {
			// next 指向更晚入队的
			this.#rear.next = node;
			this.#rear = node;
		}
		this.#queueSize++;
	}

	pull() {
		const val = this.peek();
		// 删除头结点
		this.#front = this.#front.next;
		this.#queueSize--;
		return val;
	}

	toArray() {
		let node = this.#front;
		const res = new Array(this.size);
		for (let i = 0; i < res.length; i++) {
			res[i] = node.val;
			node = node.next;
		}
		return res;
	}
}

/* 数组实现队列 */
class ArrayQueue {
	#queue = [];

	get size() {
		return this.#queue.length;
	}

	empty() {
		return this.#queueSize === 0;
	}

	peek() {
		if (this.empty()) throw new Error("empty queue");
		return this.#queue[0];
	}

	push(val) {
		this.#queue.push(val);
	}

	pull(val) {
		if (this.empty()) throw new Error("empty queue");
		this.#queue.shift();
	}

	toArray() {
		return this.#queue;
	}
}
```

## 双向队列

比队列更灵活，其头、尾均能入队或出队

```js
/* 基于双向链表实现 */
class LinkedListDeque {
	front = null;
	rear = null;
	len = null;

	get size() {
		return this.len;
	}

	isEmpty() {
		return this.len === 0;
	}

	/* 队首入队 */
	pushFront(val) {
		const node = new DualNode(val);
		if (this.len === 0) {
			this.front = node;
			this.rear = node;
		} else {
			node.next = this.front;
			this.front.prev = node;
			this.front = node;
		}
		this.len++;
	}

	/* 队尾入队 */
	pushRear(val) {
		const node = new DualNode(val);
		if (this.len === 0) {
			this.front = node;
			this.rear = node;
		} else {
			node.perv = this.rear;
			this.rear.next = node;
			this.rear = node;
		}
		this.len++;
	}

	/* 队首出队 */
	pullFront() {
		if (this.len === 0) {
			return null;
		}

		const val = this.front.val;
		if (this.len === 1) {
			this.front = this.rear = null;
		} else {
			const temp = this.front.next;
			temp.prev = null;
			this.front.next = null;
			this.front = temp;
		}
		this.len--;
		return val;
	}

	/* 队尾出队 */
	pullRear() {
		if (this.len === 0) {
			return null;
		}

		const val = this.rear.val;
		if (this.len === 1) {
			this.rear = this.front = null;
		} else {
			const temp = this.rear.prev;
			temp.next = null;
			this.rear.prev = null;
			this.rear = temp;
		}
		this.len--;
		return val;
	}

	peekFront() {
		return this.len === 0 ? null : this.front.val;
	}

	peekRear() {
		return this.len === 0 ? null : this.rear.val;
	}
}
```

## 二叉树（ Binary Tree）

非线性数据结构。每个父节点（Parent Node）存在指针指向左/右子节点（Left/Right Child Node），自后者向下的树被称为左/右子树（Left/Right Subtree）

```js
function TreeNode(val, left, right) {
	this.val = val === undefined ? 0 : val;
	this.left = left === undefined ? null : left;
	this.right = right === undefined ? null : right;
}
```

相关术语：

- 根节点（Root Node），最顶层节点，无父节点

- 叶节点（Leaf Node），无子节点

- 层（Level），节点所在层级，自根节点（层级 1）向下依次递增

- 度（Degree），节点的子结点数量

- 边（Edge），指向两个子结点的指针

- 深度（Depth），节点距根节点的垂直距离（按边数衡量）

- 高度（Height），节点距最深叶节点的垂直距离（按边数衡量）

二叉树类型：

- 完美二叉树（Perfect Binary Tree），又称满二叉树，即当树高度为$h$时，节点总数为$2^{h+1} - 1$。为二叉树的“最佳状态”，可完全发挥“分治”的优势

- 完全二叉树（Complete Binary Tree），只有最底层节点有空缺，且尽量靠左填充

- 完满二叉树（Full Binary Tree），非叶子节点度数均为 2

- 平衡二叉树（Balanced Binary Tree），任意节点左右子树高度差的绝对值$\leq 1$

- 当所有节点均偏向一边时**退化**为链表，相比二叉树：

  |                         | 完美二叉树         | 链表  |
  | ----------------------- | ------------------ | ----- |
  | 第 $i$ 层节点数量       | $2^{i-1}$          | $1$   |
  | 高 $h$ 树的叶节点数量   | $2^h$              | $1$   |
  | 高 $h$ 树的节点总数     | $2^{h+1} - 1$      | $h+1$ |
  | 总节点数位 $n$ 时的高度 | $\log_2 (n+1) - 1$ | $n-1$ |

**二叉树可用数组表示**。按同高度完美二叉树总节点数初始化数组，则索引为$i$（根节点为$0$）的节点，其左右子节点索引分别为：$2i+1$和$2i+2$，“空位”可用$null$表示（完美二叉树中只出现在末尾，因而可被省略）

- 优点：无需存储指针，节省空间；可随机访问节点

- 缺点：当“空位”较多时，空间利用率较低

二叉树的遍历可分为：

- 广度优先（Breadth-First Traversal），即层序遍历（ Hierarchical-Order Traversal）：按从左到右顺序逐层遍历，一般借队列实现

- 深度优先（Depth-First Traversal），一般借递归实现，又可分为：

  - 前序遍历（Pre-Order Traversal）：根结点 -> 左子树 -> 右子树

  - 中序遍历（In-Order Traversal）：左子树 -> 根结点 -> 右子树

  - 后序遍历 (Post-Order Traversal)：左子树 -> 右子树 -> 根结点

```js
/* 层序 */
function hierarchicalOrder(root) {
	const queue = [root];
	const list = [];
	while (queue.length) {
		const node = queue.shift();
		list.push(node.val);
		if (node.left) queue.push(node.left);
		if (node.right) queue.push(node.right);
	}
	return list;
}

/* 前序 */
function preOrder(root) {
	if (root === null) return;
	list.push(root.val);
	preOrder(root.left);
	preOrder(root.right);
}

/* 中序 */
function inOrder(root) {
	if (root === null) return;
	preOrder(root.left);
	list.push(root.val);
	preOrder(root.right);
}

/* 后序 */
function inOrder(root) {
	if (root === null) return;
	preOrder(root.left);
	preOrder(root.right);
	list.push(root.val);
}
```

## 二叉搜索树（Binary Search Tree）

满足以下条件：

1. 左子树任意节点值 < 根节点值 < 右子树任意节点值

2. 任意节点的左/右子树均为二叉搜索树，即满足条件 1

---

相关操作：

- **查找节点**，从根结点起将当前节点值`cur.val`与目标节点值`num`做比较：

  - 若`cur.val<num`，则目标节点在右子树中，执行`cur=cur.right`；

  - 若`cur.val>num`，则目标节点在左子树中，执行`cur=cur.left`；

  - 若`num=cur.val`，则跳出循环并返回当前节点；

- **插入节点**，按查找逻辑找到相应**叶位置**（而非中间插入），在其父节点上完成插入。二叉搜索树不允许节点重复，若值已存在则直接返回

- **删除节点**：查找到待删节点，根据其子节点数量：

  - 若为 0，则直接删除

  - 若为 1，则将待删节点替换为其子节点

  - 若为 2，则按**中序遍历顺序**找到其后继节点，将后者节点值暂存后**递归删除**，再用该值替换待删节点值

- **排序**，**二叉搜索树的中序遍历为升序**

```js
/* 查找节点 */
function search(num) {
	let cur = root;
	while (cur !== null) {
		if (num > cur.val) cur = cur.right;
		else if (num < cur.val) cur = cur.left;
		else break;
	}
	return cur;
}

/* 插入节点 */
function insert(num) {
	if (root === null) return null;
	let cur = root;
	let pre = null;
	while (cur !== null) {
		if (num === cur.val) return null;
		pre = cur;
		if (num > cur.val) cur = cur.right;
		else cur = cur.left;
	}
	const node = new TreeNode(num);
	if (pre.val < num) pre.right = node;
	else pre.left = node;
	return node;
}

/* 删除节点 */
function remove(num) {
	if (root === null) return null;
	let cur = root;
	let pre = null;
	while (cur !== null) {
		if (cur.val === num) break;
		pre = cur;
		if (cur.val < num) cur = cur.right;
		else cur = cur.left;
	}
	if (cur === null) return null;

	if (cur.left === null || cur.right === null) {
		// 子节点数量为 0 或 1
		const child = cur.left !== null ? cur.left : cur.right;
		if (pre.left === cur) pre.left = child;
		else pre.right = child;
	} else {
		// 子节点数量为 2
		const next = getInOrderNext(cur.right);
		const tmp = next.val;
		remove(next.val);
		cur.val = tmp;
	}
}

/* 
	按中序遍历获取后继节点
	注意 root 不能为 null，否则该方法失效
 */
function getInOrderNext(root) {
	while (root.left !== null) {
		root = root.left;
	}
	return root;
}
```

关于效率，**理想情况下**（左右平衡）二叉搜索树各项操作时间复杂度均为$O(\log n)$，**数据量较大时优于数组**

## AVL 树

动态插入/删除操作将使二叉搜索树朝链表方向退化，操作时间复杂度随之向$O(n)$劣化。而 AVL 树则不会，后者又被称为平衡二叉搜索树

```js
class AVLTreeNode {
	constructor(val, left, right, height) {
		this.val = val === undefined ? 0 : val;
		this.height = height === undefined ? 0 : height;
		this.left = left === undefined ? null : left;
		this.right = right === undefined ? null : right;
	}
}
```
