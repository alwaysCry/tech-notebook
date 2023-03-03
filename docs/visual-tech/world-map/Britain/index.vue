<template>
	<svg ref="svgRef"></svg>
</template>

<script setup>
import { geoAlbers, select, geoPath } from "d3";
import { onMounted, ref } from "vue";
import * as topojson from "topojson";
import uk from "./uk.json";

const width = 960;
const height = 1160;

const projection = geoAlbers()
	.center([0, 55.4])
	.rotate([3, 0])
	.parallels([50, 60])
	.scale(1200 * 5)
	.translate([width / 2, height / 2]);
const path = geoPath().projection(projection);

const svgRef = ref(null);
onMounted(() => {
	const svg = select(svgRef.value)
		.style("width", width)
		.style("height", height);

	const subunits = topojson.feature(uk, uk.objects.subunits);
	const places = topojson.feature(uk, uk.objects.places);

	const subunitFillColor = {
		SCT: "#ddc",
		WLS: "#cdd",
		NIR: "#cdc",
		ENG: "#dcd",
		IRL: "none",
	};

	svg
		.selectAll(".subunit")
		.data(subunits.features)
		.enter()
		.append("path")
		.attr("class", function (d) {
			return "subunit " + d.id;
		})
		.attr("fill", function (d) {
			return subunitFillColor[d.id];
		})
		.attr("d", path);

	svg
		.append("path")
		.datum(
			topojson.mesh(uk, uk.objects.subunits, function (a, b) {
				return a !== b && a.id !== "IRL";
			})
		)
		.attr("d", path)
		.attr("class", "subunit-boundary")
		.attr("fill", "none")
		.attr("stroke", "#777")
		.attr("stroke-dasharray", "2,2")
		.attr("stroke-linejoin", "round");

	svg
		.append("path")
		.datum(
			topojson.mesh(uk, uk.objects.subunits, function (a, b) {
				return a === b && a.id === "IRL";
			})
		)
		.attr("d", path)
		.attr("class", "subunit-boundary IRL")
		.attr("fill", "none")
		.attr("stroke", "#aaa")
		.attr("stroke-dasharray", "2,2")
		.attr("stroke-linejoin", "round");

	svg
		.selectAll(".subunit-label")
		.data(subunits.features)
		.enter()
		.append("text")
		.attr("class", function (d) {
			return "subunit-label " + d.id;
		})
		.attr("transform", function (d) {
			return "translate(" + path.centroid(d) + ")";
		})
		.attr("fill", "#777")
		.attr("fill-opacity", ".5")
		.attr("font-size", "20px")
		.attr("font-weight", "300")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return d.properties.name;
		});

	svg
		.append("path")
		.datum(places)
		.attr("d", path)
		.attr("class", "place");

	svg
		.selectAll(".place-label")
		.data(places.features)
		.enter()
		.append("text")
		.attr("class", "place-label")
		.attr("transform", function (d) {
			// console.log(projection(d.geometry.coordinates));
			return "translate(" + projection(d.geometry.coordinates) + ")";
		})
		.attr("x", function (d) {
			return d.geometry.coordinates[0] > -1 ? 6 : -6;
		})
		.attr("dy", ".35em")
		.style("text-anchor", function (d) {
			return d.geometry.coordinates[0] > -1 ? "start" : "end";
		})
		.text(function (d) {
			return d.properties.name;
		});
});
</script>
