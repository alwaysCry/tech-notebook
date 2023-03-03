# 深克隆专题

不完美的深克隆方法：

```js
const target = JSON.parse(JSON.stringify(source));
```

缺陷：

- 无法实现克隆函数 、RegExp 等特殊对象
- 会抛弃对象的 constructor，后者将指向 Object
- 若存在循环引用则会报错

最简单深拷贝：

```js
function clone(source) {
	const target = {};
	for (let i in source) {
		if (!source.hasOwnProperty(i)) continue;
		if (typeof source[i] === "object") {
			target[i] = clone(source[i]);
		} else {
			target[i] = source[i];
		}
	}
	return target;
}
```

一些要点：

- 递归改循环实现，避免处理大深度对象时爆栈
- 避免因对象循环引用而引起的死循环，也要维持可能存在的多个 key 对同一对象的引用关系
- 要能兼顾到其他集合类型：Array、Map、Set
- 拷贝对象时尽可能保留其原型，以及 constructor 指向
- 拷贝时正确处理函数、Date、RegExp、Symbol 等类型

```js
function cloneTrackRefer(rootSource) {
	const rootTarget = getTarget(rootSource);
	const loopStack = [{ parent: null, key: null, source: rootSource }];
	const exists = new WeakMap();

	while (loopStack.length) {
		const node = loopStack.pop(); // 深度优先
		const { parent, key, source } = node;

		const existObject = exists.get(source);
		if (existObject) {
			insertTarget(existObject, parent, key);
			continue;
		}

		let target;
		if (!parent) {
			target = rootTarget;
		} else {
			target = getTarget(source);
			insertTarget(target, parent, key);
		}
		exists.set(source, target);

		iterate(source, (k) => {
			const value = getValue(source, k);
			if (isIterable(value)) {
				// 若为 Object 或集合类型，则直接推入栈中
				loopStack.push({ parent: target, key: k, source: value });
				return;
			}

			if (isObject(value)) {
				// 若为其他对象 Date、Error、RegExp ... 则需检查是否出现过
				const existValue = exists.get(value);
				// 出现过则直接复用
				if (existValue) {
					insertTarget(existValue, target, k);
					return;
				}
				const copiedValue = copy(value);
				exists.set(value, copiedValue);
				insertTarget(copiedValue, target, k);
			} else {
				const copiedValue = copy(value);
				insertTarget(copiedValue, target, k);
			}
		});
	}

	return rootTarget;
}

function isObject(source) {
	return source !== null && typeof source === "object";
}

// 其实没考虑到人工修改 constructor 的可能性，但也保留了对象的原型
function getTarget(source) {
	const Ctor = source.constructor;
	return new Ctor();
}

const objectTag = "[object Object]";
const arrayTag = "[object Array]";
const mapTag = "[object Map]";
const setTag = "[object Set]";

const numberTag = "[object Number]";
const stringTag = "[object String]";
const boolTag = "[object Boolean]";
const undefinedTag = "[object Undefined]";
const nullTag = "[object Null]";
const errorTag = "[object Error]";
const dateTag = "[object Date]";
const regexpTag = "[object RegExp]";
const symbolTag = "[object Symbol]";

function getTag(source) {
	return Object.prototype.toString.call(source);
}

function isIterable(source) {
	const tag = getTag(source);
	return [objectTag, arrayTag, mapTag, setTag].includes(tag);
}

function insertTarget(target, parent, key) {
	const tag = getTag(parent);

	switch (tag) {
		case objectTag:
		case arrayTag:
			parent[key] = target;
			break;
		case mapTag:
			parent.set(key, target);
			break;
		case setTag:
			parent.add(target);
			break;
	}
}

function getValue(source, key) {
	const tag = getTag(source);

	if (tag === objectTag || tag === arrayTag) {
		return source[key];
	}

	if (tag === mapTag) {
		return source.get(key);
	}

	if (tag === setTag) {
		return key;
	}
}

function iterate(source, fn) {
	const tag = getTag(source);

	if (tag === objectTag || tag === arrayTag) {
		for (let k in source) {
			if (!source.hasOwnProperty(k)) continue;
			fn(k);
		}
	}

	if (tag === mapTag || tag === setTag) {
		source.forEach(fn);
	}
}
function copy(source) {
	const tag = getTag(source);

	switch (tag) {
		case numberTag:
		case stringTag:
		case boolTag:
		case nullTag:
		case undefinedTag:
			return source;
		case dateTag:
		case errorTag:
			const Ctor = source.constructor;
			return new Ctor(source);
		case regexpTag:
			return copyRegExp(source);
		case symbolTag:
			return copySymbol(source);
		default:
			return null;
	}
}

// TODO: 多了解下 Symbol
function copySymbol(source) {
	return Object(Symbol.prototype.valueOf.call(source));
}

// TODO: 多了解下 RegExp
function copyRegExp(source) {
	const reFlags = /\w*$/;
	const result = new source.constructor(source.source, reFlags.exec(source));
	result.lastIndex = source.lastIndex;
	return result;
}
```

一些工具方法：

- 生成指定深度和每层广度对象：

  ```js
  function createData(depth, breadth) {
  	const data = {};
  	let current = data;

  	for (let i = 0; i < depth; i++) {
  		current = current["data"] = {};
  		for (let j = 0; j < breadth; j++) {
  			current[j] = j;
  		}
  	}

  	return data;
  }

  function createData2(breadth, depth, current = 0) {
  	const data = {};

  	for (let i = 0; i < breadth; i++) {
  		if (i < breadth - 1 || current === depth - 1) {
  			data[i] = i;
  			continue;
  		}
  		data[i] = createData2(breadth, depth, ++current);
  	}

  	return data;
  }
  ```

- 测试指定毫秒内指定方法的运行次数：

  ```js
  function runTime(fn, time) {
  	const startTime = Date.now();
  	let count = 0;
  	while (Date.now() - startTime < time) {
  		fn();
  		count++;
  	}

  	return count;
  }
  ```
