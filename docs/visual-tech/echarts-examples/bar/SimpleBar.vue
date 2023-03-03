<script>
import { h, onMounted, ref } from "vue";
/** @typedef {import('echarts')} echarts */
import * as echarts from "echarts";

const data = [
	{ value: 900, name: "网页挂马" },
	{ value: 800, name: "webshell" },
	{ value: 700, name: "敏感关键字" },
	{ value: 600, name: "敏感信息" },
	{ value: 500, name: "外链" },
	{ value: 400, name: "JS挖矿脚本" },
	{ value: 300, name: "暗链" },
	{ value: 200, name: "黑页" },
	{ value: 100, name: "坏链" },
].slice(0, 5);

/**
 * @type {echarts.EChartsCoreOption}
 */
const option = {
	grid: {
		left: "0%",
		right: "4%",
		bottom: "25%",
		top: "15%",
		// containLabel: true, // 可防止坐标轴标签因过长而溢出
	},
	xAxis: {
		type: "category",
		data: data.map((i) => i.name),
		// boundaryGap: false,
		axisLine: false,
		axisTick: false,
		axisLabel: {
			interval: 0,
			margin: 15,
			textStyle: {
				color: "#D9E7FF",
				fontSize: 14,
			},
		},
	},
	yAxis: {
		type: "value",
		data: data.map((i) => i.value),
		axisLine: false,
		axisTick: false,
		axisLabel: false,
		splitLine: false,
	},
	series: [
		{
			name: "安全事件",
			type: "bar",
			barWidth: 14,
			label: {
				distance: 10,
				show: true,
				position: "top",
				textStyle: {
					color: "#D9E7FF",
					fontFamily: "D-DIN",
					fontSize: 22,
				},
			},
			itemStyle: {
				color: "#4EE7FF",
			},
			data: data.map((i) => i.value),
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
				style: {
					width: "396px",
					height: "209px",
				},
				ref: (elem) => (elemRef.value = elem),
			});
	},
};
</script>
