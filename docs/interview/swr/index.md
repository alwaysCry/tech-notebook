# 简单 SWR 机制及 LRU 算法

SWR 来自于  stale-while-revalidate：一种由  HTTP RFC 5861  推广的 HTTP 缓存失效策略。类似于 max-age，用于控制缓存，是 Cache-Control 的一个指令

单词 stale 意为陈旧的，不新鲜的。HTTP 缓存领域用 stale 来形容一个缓存过期了。
普通缓存策略为：在资源缓存过期后若想再次使用，需先对其进行 revalidate，在此期间，客户端得等待直到 revalidate 请求结束

在一些专注性能场景下，上述同步更新缓存的机制被认为有性能问题。而 SWR 策略即为：当 revalidate 请求进行时，客户端可无需等待而直接用过期的缓存。revalidate 完后更新缓存，下次用的就是新的

所以 SWR 实现的功能可理解为：后台缓存刷新，异步缓存更新。其通常与 max-age 一起使用，如 `Cache-Control: max-age=1, stale-while-revalidate=59` 表示：

- 该缓存 1s 内是新鲜的
- 1-60s 内虽然过期，但仍可直接使用，同时进行异步 revalidate
- 60s 后完全过期便需进行传统的同步 revalidate

SWR 常用场景有：当前天气状况的 API，或过去一小时内编写的头条新闻

## 代码实现

下面看如何实现它。首先拆解目标：

1. 请求数据时先从缓存中读取，并立即返回给调用者
2. 若数据已过期，则发起 fetch 请求，获取最新数据
3. 支持过期时间

需用一个“容器”缓存请求回来的复杂数据，在 JS 中很容易想到使用 Object，前者虽然没什么问题，但其结构为 “字符串—值” 的对应，只支持字符串作为键名；而在 ES6 Map 提供了 “值—值” 对应这种更完善的映射，更适用于“键值对”这种数据结构。面试中应随时向面试官展现知识储备，这里选择 Map 更好

### 支持数据缓存和缓存过期时间

显然，需被缓存的数据即为请求返回的数据；同时也应想到，**若重复调用函数，最好不要发送多次请求**。所以缓存数据中应有：

- 请求返回的数据
- 获取到数据的时间
- 当前正在进行中的请求（如有），避免多次请求

```js
const cache = new Map();

async function swr(cacheKey, fetcher, cacheTime) {
	// 首先从缓存中获取
	let data = cache.get(cacheKey) || { value: null, time: 0, promise: null };
	// 写入缓存
	cache.set(cacheKey, data);

	// 是否过期
	const isStaled = Date.now() - data.time > cacheTime;
	// 已过期（包含初次调用时）且未在请求中，则需发送请求
	if (isStaled && !data.promise) {
		// 保存当前请求的 promise
		data.promise = fetcher()
			.then((val) => {
				data.value = val;
				data.time = Date.now();
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				data.promise = null;
			});
	}
	// 正在请求中且无缓存可用（即对应初次调用但未返回时），则复用该 promise
	if (data.promise && !data.value) await data.promise;
	// 其余情况（正在请求中，但有缓存可用），返回数据
	return data.value;
}
```

测试调用如下：

```js
const data = await swr("cache-key", fetcher, 3000);
```

首次调用通过接口请求数据，紧随着调用会复用之前的请求。若调用间隔超过 3s，则首先返回缓存，同时调用接口更新

## 条件请求

目前代码虽使用了 Map，但 cacheKey 还是字符串，未真正发挥前者的作用

作为基础能力的补充，可考虑使形参 cacheKey 可为函数，以此实现条件请求特性。将其返回值作为 cacheKey，如有返回则执行上述逻辑，如没有则不缓存

```js
const shouldCache = function() {...}

// cacheKey 可为函数
const data = await swr(shouldCache, fetcher, 3000)

async function swr(cacheKey, fetcher, cacheTime) {
  // 若是函数，则调用之并将返回值作为 cacheKey
  const cKey = typeof cacheKey === 'function' ? cacheKey() : cacheKey;

   // 如有 cacheKey 才启用缓存
  if (cKey) {
    let data = cache.get(cKey) || { value: null, time: 0, promise: null };
    cache.set(cKey, data);
    // ...
  } else {
    return await fetcher();
  }
}
```

## LRU 缓存淘汰算法

我们知道 **Map 的遍历顺序就是插入顺序**，加上其键值对的数据结构，很容易基于此特性来实现 LRU 缓存淘汰策略

LRU（Least recently used，最近最少使用）算法根据数据的历史访问记录来淘汰数据，核心思想为：若数据最近被访问过，则将来被访问的几率也更高（Vue 的 keep-alive 即有用到此算法）

整个流程大致为：

1. 新加入的数据插入到第一项
2. 每当缓存命中（即缓存数据被访问），则将数据提升到第一项
3. 当缓存数迭满时，将最后一项数据丢弃

这里先对 Map 做些改造：

- 规定其最大缓存容量 capacity
- 向外暴露的 get 和 set API 用法保持不变

```js
class LRUCache {
	constructor(capacity) {
		this.cache = new Map();
		this.capacity = capacity; // 最大缓存容量
	}

	get(key) {
		// 存在即更新（先删除再加入）
		if (this.cache.has(key)) {
			const tmp = this.cache.get(key);
			this.cache.delete(key);
			this.cache.set(key, tmp);
			return tmp;
		}
		return undefined;
	}

	set(key, value) {
		if (this.cache.has(key)) {
			// 存在即更新（先删除再加入）
			this.cache.delete(key);
		} else if (this.cache.size >= this.capacity) {
			// 不存在即加入
			// 缓存超过最大值，则移除最近未使用的，即 map 的第一个 key
			// map.keys() 会返回 Iterator 对象
			this.cache.delete(this.cache.keys().next().value);
		}
		this.cache.set(key, value);
	}
}

const cache = new LRUCache(50); // 缓存最大容量为 50
```

使用 Map 实现 LRU 的时间复杂度为 O(1)
