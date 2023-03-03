<template>
	<svg ref="svgRef" :viewBox="[0, 0, width, height]">
		<defs>
			<mask :id="maskId">
				<rect :height="height" fill="#fff">
					<animate
						dur="15s"
						attributeName="width"
						:values="`${0 - 80};${width + height - 80}`"
						repeatCount="indefinite"
					/>
				</rect>
			</mask>
		</defs>
		<image :xlink:href="bg" :width="width" :height="height" />
		<g :mask="`url(#${maskId})`">
			<g
				v-for="(d, index) in data"
				:key="d.srcAddress"
				:transform="`translate(${projection([
					d.srcXpoint,
					d.srcYpoint,
				])})`"
			>
				<circle fill="rgba(81,249,249,0.15)" stroke="#40BFFF">
					<animate
						dur="2s"
						attributeName="r"
						values="0;4;8;12;16;5"
						repeatCount="indefinite"
					/>
				</circle>
				<circle :r="5" fill="#01EBFD" />
			</g>
		</g>
		<image :xlink:href="sweep" :width="height" :height="height">
			<animate
				dur="15s"
				attributeName="x"
				:values="`${height * -1};${width}`"
				repeatCount="indefinite"
			/>
		</image>
	</svg>
</template>

<script setup>
import { onMounted, ref, shallowRef } from "vue";
import { select, geoEquirectangular, geoPath } from "d3";
import * as topojson from "topojson";
import world from "./world-countries.json";
import bg from "./bg.png";
import sweep from "./sweep.png";
import cuid from "cuid";

const svgRef = ref(null);
const width = 1000;
const height = 440;
const maskId = cuid();

/* 
    美国洛杉矶: [-118.24311, 34.052713],
    香港邦泰: [114.195466, 22.282751],
    美国芝加哥: [-87.801833, 41.870975],
    加纳库马西: [-4.62829, 7.72415],
    英国曼彻斯特: [-1.657222, 51.886863],
    德国汉堡: [10.01959, 54.38474],
    哈萨克斯坦阿拉木图: [45.326912, 41.101891],
    俄罗斯伊尔库茨克: [89.116876, 67.757906],
    巴西: [-48.678945, -10.493623],
    埃及达米埃塔: [31.815593, 31.418032],
    西班牙巴塞罗纳: [2.175129, 41.385064],
    柬埔寨金边: [104.88659, 11.545469],
    意大利米兰: [9.189948, 45.46623],
    乌拉圭蒙得维的亚: [-56.162231, -34.901113],
    莫桑比克马普托: [32.608571, -25.893473],
    阿尔及利亚阿尔及尔: [3.054275, 36.753027],
    阿联酋迪拜: [55.269441, 25.204514],
    匈牙利布达佩斯: [17.108519, 48.179162],
*/
const data = shallowRef([
	{
		srcAddress: "Peking", // 攻击源地址
		attackNum: 66, // 攻击次数
		attackerNum: 5, // 攻击者数量
		srcXpoint: 116,
		srcYpoint: 40,
	},
	{
		srcAddress: "Paris", // 攻击源地址
		attackNum: 66, // 攻击次数
		attackerNum: 5, // 攻击者数量
		srcXpoint: 2,
		srcYpoint: 49,
	},
	{
		srcXpoint: -4.388361,
		srcYpoint: 11.186148,
	},
	{
		srcXpoint: -118.24311,
		srcYpoint: 34.052713,
	},
	{
		srcXpoint: -4.62829,
		srcYpoint: 7.72415,
	},
	{
		srcXpoint: 55.269441,
		srcYpoint: 25.204514,
	},
]);

const projection = geoEquirectangular()
	.scale(160)
	.translate([width / 2, height / 2 + 40]);

onMounted(() => {
	const svg = select(svgRef.value);
	// .style(
	// 	"background-color",
	// 	"#3d3c3b"
	// );

	const countries = topojson.feature(
		world,
		world.objects.world_countries_data
	);

	// const path = geoPath(projection);

	// svg
	// 	.append("path")
	// 	.datum(
	// 		topojson.merge(
	// 			world,
	// 			world.objects.world_countries_data.geometries
	// 		)
	// 	)
	// 	.attr("fill", "white")
	// 	.style("fill-opacity", 0.5)
	// 	.attr("d", path);
});
</script>
