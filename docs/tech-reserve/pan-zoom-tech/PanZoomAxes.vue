<template>
	<svg :viewBox="[0, 0, width, height]" ref="svgRef">
		<defs>
			<linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0.0%" stop-color="#2c7bb6"></stop>
				<stop offset="12.5%" stop-color="#00a6ca"></stop>
				<stop offset="25.0%" stop-color="#00ccbc"></stop>
				<stop offset="37.5%" stop-color="#90eb9d"></stop>
				<stop offset="50.0%" stop-color="#ffff8c"></stop>
				<stop offset="62.5%" stop-color="#f9d057"></stop>
				<stop offset="75.0%" stop-color="#f29e2e"></stop>
				<stop offset="87.5%" stop-color="#e76818"></stop>
				<stop offset="100.0%" stop-color="#d7191c"></stop>
			</linearGradient>
		</defs>

		<rect
			x="0.5"
			y="0.5"
			:width="width - 1"
			:height="height - 1"
			:fill="`url(#${gradId})`"
			stroke="#000"
			ref="viewRef"
		></rect>
	</svg>
</template>

<script setup>
import { h, onMounted, ref } from "vue";
import cuid from "cuid";
import {
	axisBottom,
	axisRight,
	scaleLinear,
	select,
	zoom,
	zoomIdentity,
} from "d3";

const svgRef = ref(null);
const viewRef = ref(null);
const width = 1000;
const height = 500;
const gradId = cuid();

const x = scaleLinear()
	.domain([-1, width + 1])
	.range([-1, width + 1]);

const y = scaleLinear()
	.domain([-1, height + 1])
	.range([-1, height + 1]);

const xAxis = axisBottom(x)
	/*
		number 类型的入参会作为底层 continuous.ticks([count]) 的参数, 默认为 10
	 */
	.ticks((width / height) * 10)
	.tickSize(height)
	.tickPadding(8 - height);

const yAxis = axisRight(y)
	.tickSize(width)
	.tickPadding(8 - width);

onMounted(() => {
	const svg = select(svgRef.value);
	const view = select(viewRef.value);
	const gX = svg.append("g").attr("class", "axis axis--x").call(xAxis);
	const gY = svg.append("g").attr("class", "axis axis--y").call(yAxis);

	const zoomControl = zoom()
		// 设定缩放的范围，默认 [0, ∞]
		.scaleExtent([1, 40])
		// 设定平移的范围，默认 [[-∞, -∞], [+∞, +∞]]
		.translateExtent([
			[-100, -100],
			[width + 90, height + 100],
		])
		.filter(filter)
		.on("zoom", zoomed);

	// 过滤 zoom 元素上的 MouseEvent 和 WheelEvent
	// 若返回 falsey 则该事件不触发 zoom 动作
	function filter(event) {
		// 不触发 event 的默认行为，如：按下 ctrl + 滚轮滚动时缩放页面
		event.preventDefault();
		// 此即 zoom.filter 的默认设置：按下 ctrl 时的任何鼠标事件都将被忽略（不包括滚轮）
		return (!event.ctrlKey || event.type === "wheel") && !event.button;
	}

	function zoomed({ transform }) {
		view.attr("transform", transform);
		// transform.rescaleX(x) 入参须为 continues scale，
		// 返回其 domain 被 transformed 后的拷贝
		// transform.rescaleY(y) 同理
		const copyX = transform.rescaleX(x);
		const copyY = transform.rescaleY(y);
		gX.call(xAxis.scale(copyX));
		gY.call(yAxis.scale(copyY));
	}

	svg.call(zoomControl);

	function reset() {
		svg.transform().duration(750).call(zoom.transform, zoomIdentity);
	}
});
</script>

<style>
svg {
	cursor: grabbing;
}
.axis .domain {
	display: none;
}

.axis line {
	stroke-opacity: 0.3;
	shape-rendering: crispEdges;
}
</style>
