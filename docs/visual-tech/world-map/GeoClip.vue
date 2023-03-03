<template>
	<canvas ref="canvasRef" :width="width" :height="height"></canvas>
</template>

<script setup>
import * as topojson from "topojson";
import world from "./land-50m.json";
import { geoClipAntimeridian, geoPath, geoRotation } from "d3";
import { geoBonne } from "d3-geo-projection";
import { geoClipPolygon } from "d3-geo-polygon";
import { onMounted, ref } from "vue";

const width = 640;
const height = 640;
const land = topojson.feature(world, world.objects.land);

const projection = geoBonne()
	.parallel(52)
	.rotate([-20, 0])
	.center([0, 52])
	.translate([width / 2, height / 2])
	.scale(width);

const n = 10;
const p = 80;
const viewport = {
	type: "Polygon",
	coordinates: [
		[
			...Array.from({ length: n }, (_, t) => [
				p + ((width - p * 2) * t) / n,
				p,
			]),
			...Array.from({ length: n }, (_, t) => [
				width - p,
				((height - p * 2) * t) / n + p,
			]),
			...Array.from({ length: n }, (_, t) => [
				p + ((width - p * 2) * (n - t)) / n,
				height - p,
			]),
			...Array.from({ length: n }, (_, t) => [
				p,
				((height - p * 2) * (n - t)) / n + p,
			]),
			[p, p],
		].map((p) => projection.invert(p)),
	],
};

const clipPolygon = geoClipPolygon({
	type: "Polygon",
	coordinates: [
		viewport.coordinates[0].map(geoRotation(projection.rotate())),
	],
});

const canvasRef = ref(null);
onMounted(() => {
	const context = canvasRef.value.getContext("2d");
	const path = geoPath(projection, context);

	projection.preclip(geoClipAntimeridian);

	context.beginPath();
	path(land);
	context.fillStyle = "#ddd";
	context.fill();

	context.beginPath();
	path(viewport);
	context.strokeStyle = "#f00";
	context.stroke();

	projection.preclip(clipPolygon);

	context.beginPath();
	path(land);
	context.fillStyle = "yellow";
	context.fill();
	context.strokeStyle = "blue";
	context.stroke();
});
</script>
