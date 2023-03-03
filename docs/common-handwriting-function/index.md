# 常见手写功能

## 分区功能

将数组按是否大于基准值分区，以基准值为分割点分为左右侧

```js
function partition(arr, pivotIdx = 0) {
	const pivot = arr[pivotIdx];
	let tail = pivotIdx + 1;
	for (let i = tail; i <= arr.length - 1; i++) {
		if (arr[i] < pivot) {
			[arr[i], arr[tail]] = [arr[tail], arr[i]];
			tail++;
		}
	}
	[arr[pivotIdx], arr[tail - 1]] = [arr[tail - 1], arr[pivotIdx]];
	return arr;
}
```
