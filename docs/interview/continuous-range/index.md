# 求连续区间算法题二则

## 题一：求连续区间

### 要求

输入是 1,2,3,5,7,8,10 输出要求是 1~3 5 7~8 10

### 题解

题目要求求出连续区间，再格式化成字符串

- 当 arr[i+1] 等于 arr[i] + 1 时，说明是连续的，需继续往下找
- 否则就到了区间的边界，记录下区间的起始位置

如此循环一遍数组，把区间 push 到数组里：

```js
function calcContinuousRanges(arr) {
	let continuousRanges = [];
	let index = 0;
	while (index < arr.length) {
		const range = {
			start: arr[index],
			end: arr[index],
		};
		while (index < arr.length && arr[index + 1] === arr[index] + 1) {
			range.end = arr[index + 1]; // 扩展区间边界
			index++;
		}
		// 直到不满足
		continuousRanges.push(range);
		index++;
	}
	const formatted = continuousRanges
		.map(({ start, end }) => {
			return start === end ? start : `${start}~${end}`;
		})
		.join(" ");

	console.log(formatted);
}
```

### 小结

思路就是先求出连续区间，然后格式化输出。连续区间就是判断 arr[i+1] 和 arr[i] 的关系，若连续就 index++ 继续往下找，直到找到区间的结束

## 题二：48 位时间位图转字符串

### 要求

写一个函数 timeBitmapToRanges，将下述规则描述的时间位图转换成一个时间区间数组

- **规则描述**：将一天按每半小划分成 48 段，用一个位图表示选中的时间区间
  - 例如 `110000000000000000000000000000000000000000000000` 表示只有第一个半小时和第二个半小时被选中了，即对应 00:00~01:00 的时间区间
  - 一个位图中可能有多个不连续的时间区间被选中，例如：`110010000000000000000000000000000000000000000000`，表示 00:00-1:00 和 02:00-02:30 这两个时间区间被选中了
- **示例输入**：`110010000000000000000000000000000000000000000000`
- **示例输出**：`["00:00~01:00", "02:00~02:30"]`

### 解题

此题也是连续区间的题。先遍历一遍时间位图，找到所有的连续时间段的区间，然后格式化成时间的格式输出即可

- 若当前位是 1 就记录下区间的开始
- 一直 index++ 找区间的结束，直到不为 1，就记录下一个连续区间
- 循环结束后就开始格式化
- 以半小时为单位，则都要乘以 0.5，且区间的结束要多加 0.5
- 还要考虑格式化时分小时和分钟两部分：
  - 小时即整数部分，个位数要补 0
  - 分钟是小数部分，只有 30 和 0 两种情况

完整代码如下：

```js
function timeBitmapToRanges(timeBitmap) {
	let index = 0;
	let ranges = [];
	while (index < timeBitmap.length) {
		if (timeBitmap[index] === "0") {
			index++;
			continue;
		}
		let curRange = { start: index, end: index };
		while (timeBitmap[index] === "1") {
			curRange.end = index;
			index++;
		}
		ranges.push(curRange);
	}

	return ranges.map((range) => {
		let str = 0;
		return format(range.start * 0.5) + "~" + format(range.end * 0.5 + 0.5);
	});
}

function format(num) {
	const left = Math.floor(num);
	const leftStr = left < 10 ? "0" + left : left;
	const right = num % 1 === 0.5 ? 30 : 0;
	const rightStr = right < 10 ? "0" + right : right;
	return leftStr + ":" + rightStr;
}
```
