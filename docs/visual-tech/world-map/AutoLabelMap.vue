<template>
	<canvas ref="canvasRef" :width="w" :height="h"></canvas>
</template>

<script setup>
import { descending } from "d3-array";
import { csv } from "d3-fetch";
import { geoEqualEarth, geoPath } from "d3-geo";
import { onMounted, ref } from "vue";
import world from "./110m-countries.json";
import citiesCsv from "./cities.csv";

const w = 751;
const h = 413;

const canvasRef = ref(null);

const projection = geoEqualEarth()
	.scale(w / 4.5)
	.translate([(w / 2) * 0.85, h / 2]);

onMounted(async () => {
	const context = canvasRef.value.getContext("2d");
	const geoPathGen = geoPath(projection).context(context);

	const cities = await csv(citiesCsv);
	const features = {
		type: "FeatureCollection",
		features: cities
			.map((d) => {
				d.pop = +d["2030"];
				d.text = d["Urban Agglomeration"];
				d.lon = d["Longitude"];
				d.lat = d["Latitude"];
				d.text = d.text
					.replace(/.*\((.*)\).*/, "$1")
					.replace(/-.*$/, "");
				return d;
			})
			.sort((a, b) => descending(a.pop, b.pop))
			.slice(0, 100)
			.map((d) => ({
				type: "Feature",
				geometry: { type: "Point", coordinates: [+d.lon, +d.lat] },
				properties: {
					name: d.text,
					group: +d.group,
					count: d.pop / 10000,
				},
			})),
	};

	context.fillStyle = "#eee";
	context.fillRect(0, 0, w, h);

	context.fillStyle = "#fff";
	context.beginPath();
	geoPathGen(world);
	context.fill();

	context.strokeStyle = "#eee";
	context.stroke();

	context.beginPath();
	geoPathGen(features);
	context.strokeStyle = "rgba(0,0,0,1)";
	context.stroke();
});
</script>
