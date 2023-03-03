<template>
	<h5>dot grid</h5>
	<svg ref="dotGridRef" :viewBox="[0, 0, width, height]">
		<pattern
			:id="dotPatternId"
			patternUnits="userSpaceOnUse"
			x="0"
			y="0"
			:width="gridSize"
			:height="gridSize"
		>
			<rect
				:width="gridDotSize"
				:height="gridDotSize"
				:fill="gridColor"
				:x="gridSize / 2 - gridDotSize / 2"
				:y="gridSize / 2 - gridDotSize / 2"
			></rect>
		</pattern>
		<rect :fill="`url(#${dotPatternId})`" width="100%" height="100%"></rect>
		<g ref="dotGridContentRef">
			<rect
				fill="#65D097"
				rx="10"
				width="100"
				height="100"
				:x="width / 2 - 75"
				y="125"
			></rect>
			<rect
				fill="#75E6CF"
				rx="5"
				width="50"
				height="50"
				:x="width / 2 + 35"
				y="175"
			></rect>
			<rect
				fill="#5CC4FF"
				rx="3"
				width="25"
				height="25"
				:x="width / 2 + 35"
				y="235"
			></rect>
		</g>
	</svg>

	<h5>traditional grid</h5>
	<svg ref="gridRef" :viewBox="[0, 0, width, height]">
		<pattern
			:id="patternId"
			patternUnits="userSpaceOnUse"
			x="0"
			y="0"
			:width="gridSize"
			:height="gridSize"
		>
			<line :stroke="gridColor" x1="0" y1="0" :x2="gridSize * 16" y2="0"></line>
			<line :stroke="gridColor" x1="0" y1="0" x2="0" :y2="gridSize * 16"></line>
		</pattern>
		<rect :fill="`url(#${patternId})`" width="100%" height="100%"></rect>
		<g ref="gridContentRef">
			<rect
				fill="#65D097"
				rx="10"
				width="100"
				height="100"
				:x="width / 2 - 75"
				y="125"
			></rect>
			<rect
				fill="#75E6CF"
				rx="5"
				width="50"
				height="50"
				:x="width / 2 + 35"
				y="175"
			></rect>
			<rect
				fill="#5CC4FF"
				rx="3"
				width="25"
				height="25"
				:x="width / 2 + 35"
				y="235"
			></rect>
		</g>
	</svg>
</template>

<script setup>
import { onMounted, ref } from "vue";
import cuid from "cuid";
import { select, zoom } from "d3";

const dotGridRef = ref(null);
const dotGridContentRef = ref(null);
const gridRef = ref(null);
const gridContentRef = ref(null);
const dotPatternId = cuid();
const patternId = cuid();

const width = 800;
const height = 400;
const gridSize = 25;
const gridDotSize = 3;
const gridColor = "#a4a4a4";

function updateGrid(patternId, transform) {
	const { x, y, k } = transform;
	select(`#${patternId}`)
		.attr("x", x)
		.attr("y", y)
		.attr("width", gridSize * k)
		.attr("height", gridSize * k)
		.selectAll("rect, line")
		.attr("x", (gridSize * k) / 2 - gridDotSize / 2)
		.attr("y", (gridSize * k) / 2 - gridDotSize / 2)
		.attr("opacity", Math.min(k, 1));
}

onMounted(() => {
	const dotGrid = select(dotGridRef.value);
	const dotGridContent = select(dotGridContentRef.value);
	dotGrid.call(
		zoom()
			.scaleExtent([0.25, 2])
			.on("zoom", (event) => {
				dotGridContent.attr("transform", event.transform);
				updateGrid(dotPatternId, event.transform);
			})
	);

	const grid = select(gridRef.value);
	const gridContent = select(gridContentRef.value);
	grid.call(
		zoom()
			.scaleExtent([0.25, 2])
			.on("zoom", (event) => {
				gridContent.attr("transform", event.transform);
				updateGrid(patternId, event.transform);
			})
	);
});
</script>
