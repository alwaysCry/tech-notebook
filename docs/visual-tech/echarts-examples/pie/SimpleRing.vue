<script>
import { h, onMounted, ref } from "vue";

/** @typedef {import('echarts')} echarts */
import * as echarts from "echarts";

const data = [
	{
		value: 2154,
		name: "曲阜师范大学",
		color: "#c487ee",
	},
	{
		value: 3854,
		name: "潍坊学院",
		color: "#deb140",
	},
	{
		value: 3515,
		name: "青岛职业技术学院",
		color: "#49dff0",
	},
	{
		value: 3515,
		name: "淄博师范高等专科",
		color: "#034079",
	},
	{
		value: 3854,
		name: "鲁东大学",
		color: "#6f81da",
	},
	{
		value: 2154,
		name: "山东师范大学",
		color: "#00ffb4",
	},
];
const total = data.reduce((acc, cur) => acc + cur.value, 0);

const rich = {
	yellow: {
		color: "#ffc72b",
		fontSize: 30,
		padding: [5, 4],
		align: "center",
	},
	white: {
		color: "#fff",
		align: "center",
		fontSize: 14,
		padding: [21, 0],
	},
	blue: {
		color: "#49dff0",
		fontSize: 16,
		align: "center",
	},
};
/**
 * @type {echarts.EChartsCoreOption}
 */
const option = {
	backgroundColor: "#031f2d",
	title: {
		text: [`{main|${total}}`, "{sub|总考生数}"].join("\n"),
		left: "center",
		top: "center",
		textStyle: {
			rich: {
				main: {
					color: "#ffc72b",
					fontSize: 30,
					lineHeight: 50,
				},
				sub: {
					color: "#fff",
					fontSize: 18,
				},
			},
		},
	},
	series: [
		{
			data,
			color: data.map((i) => i.color),
			name: "总考生数量",
			type: "pie",
			radius: ["42%", "50%"],
			hoverAnimation: false,
			label: {
				normal: {
					formatter: (params) => {
						const { name, value } = params;
						const percent = ((value / total) * 100).toFixed(1);
						return [
							`{white|${name}}`,
							/* `{hr|}`, */
							`{yellow|${value}}`,
							`{blue|${percent}%}`,
						].join("\n");
					},
					rich,
					distanceToLabelLine: -70,
				},
			},
			labelLine: {
				normal: {
					length: 55,
					length2: 75,
					lineStyle: {
						color: "#0b5263",
					},
				},
			},
		},
	],
};

export default {
	setup() {
		const elemRef = ref();
		onMounted(() => {
			const chart = echarts.init(elemRef.value);
			chart.setOption(option);
		});

		return () =>
			h("div", {
				style: { width: "600px", height: "600px" },
				ref: (elem) => (elemRef.value = elem),
			});
	},
};
</script>
