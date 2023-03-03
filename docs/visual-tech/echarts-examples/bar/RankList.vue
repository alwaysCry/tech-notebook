<script>
import { h, onMounted, ref } from "vue";
/** @typedef {import('echarts')} echarts */
import * as echarts from "echarts";

const data = [
	{ name: "安全堡垒机", value: 646 },
	{ name: "日志审计", value: 321 },
	{ name: "病毒防护", value: 247 },
	{ name: "数据库审计", value: 192 },
	{ name: "WAF", value: 179 },
];

/** @type {echarts.EChartsCoreOption} */
const option = {
	// backgroundColor: "#000",
	grid: {
		left: "0%",
		right: "15%",
		bottom: "0%",
		top: "8%",
	},
	xAxis: {
		type: "value",
		splitLine: false,
		axisLabel: false,
		axisTick: false,
		axisLine: false,
	},
	yAxis: [
		// 左侧排名
		{
			data: data.map((_, index) => index + 1),
			type: "category",
			inverse: true,
			axisLine: false,
			axisTick: false,
			postion: "left",
			axisLabel: {
				fontSize: 12,
				align: "right",
				padding: 0,
				color: "#000",
				rich: {
					nt: {
						color: "#fff",
						backgroundColor: "#54EAFF",
						width: 18,
						height: 18,
						fontSize: 12,
						padding: [2, 1.5, 0, 1.5],
						borderRadius: 100,
						align: "center",
					},
				},
				formatter: (value) => `{nt|${value}}`,
			},
		},
		{
			// 右侧统计数字
			data: data.map((i) => i.value), //数字
			type: "category",
			inverse: true,
			position: "right",
			axisTick: false,
			axisLine: false,
			axisLabel: {
				interval: 0,
				// margin: -,
				textStyle: {
					color: "#D9E7FF",
					fontSize: 20,
					fontFamily: "D-DIN",
					align: "right",
					padding: -45, // 越小越 ->
				},
			},
		},
		{
			// 上侧名称
			data: data.map((i) => i.name),
			type: "category",
			offset: -10,
			position: "left",
			axisLabel: {
				color: `#fff`,
				fontSize: 10,
			},
			axisLine: {
				show: false,
			},
			inverse: true,
			axisTick: {
				show: false,
			},
			axisLabel: {
				interval: 0,
				textStyle: {
					color: "#D9E7FF",
					align: "left",
					verticalAlign: "bottom",
					lineHeight: 32,
					fontSize: 14,
				},
			},
		},
	],
	series: [
		{
			// name: "横向条",
			data: data.map((i) => i.value),
			zlevel: 1,
			type: "bar",
			barWidth: 4,
			animationDuration: 1500,
			itemStyle: {
				color: "#54EAFF",
				barBorderRadius: 10,
			},
		},
		{
			// name: "背景",
			data: data.map(() => Math.max(...data.map((i) => i.value))),
			type: "bar",
			barWidth: 4,
			animationDuration: 0,
			barGap: "-100%", // 令其与横向条重合
			itemStyle: {
				color: "rgba(217,231,255,0.10)",
				barBorderRadius: 30,
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
				style: { width: "380px", height: "282px" /* background: "#000" */ },
				ref: (elem) => (elemRef.value = elem),
			});
	},
};
</script>
