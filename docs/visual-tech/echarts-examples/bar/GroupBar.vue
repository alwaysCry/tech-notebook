<script>
import { h, onMounted, ref } from "vue";
/** @typedef {import('echarts')} echarts */
import * as echarts from "echarts";

/* riskEventName	string	风险名称
riskTotal	long	风险总数
criticalRiskNum	long	紧急数量
highRiskNum	long	高危数量
mediumRiskNum	long	中危数量
lowRiskNum	long	低危数量 */
let data = {
	data: [
		{
			riskEventName: "弱口令13131",
			criticalRiskNum: 400,
			highRiskNum: 250,
			mediumRiskNum: 160,
			lowRiskNum: 100,
		},
		{
			riskEventName: "web漏洞",
			criticalRiskNum: 450,
			highRiskNum: 200,
			mediumRiskNum: 100,
			lowRiskNum: 50,
		},
		{
			riskEventName: "主机漏洞",
			criticalRiskNum: 360,
			highRiskNum: 50,
			mediumRiskNum: 60,
			lowRiskNum: 117,
		},
		{
			riskEventName: "端口暴漏",
			criticalRiskNum: 700,
			highRiskNum: 530,
			mediumRiskNum: 100,
			lowRiskNum: 250,
		},
		{
			riskEventName: "信息安全",
			criticalRiskNum: 300,
			highRiskNum: 360,
			mediumRiskNum: 200,
			lowRiskNum: 400,
		},
	],
};

data = data.data;

console.log("风险等级分布Top5 >>");
console.log(data);
console.log(">=================>");

const levels = ["紧急", "高危", "中危", "低危"];
const option = {
	tooltip: {
		trigger: "axis",
		axisPointer: {
			// 坐标轴指示器，坐标轴触发有效
			type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
		},
	},
	grid: {
		left: "2%",
		right: "4%",
		bottom: "18%",
		top: "22%",
		containLabel: true,
	},
	legend: {
		data: levels,
		left: "center",
		bottom: 15,
		textStyle: {
			fontSize: 14,
			color: "#fff",
		},
		icon: "circle",
		itemWidth: 15,
		itemHeight: 15,
		itemStyle: {
			borderWidth: 2,
		},
	},
	xAxis: {
		type: "category",
		data: data.map((i) => i.riskEventName),
		axisLine: {
			lineStyle: {
				color: "rgba(95, 90, 79, 1)",
			},
		},
		axisTick: {
			show: false,
		},
		axisLabel: {
			interval: 0,
			textStyle: {
				color: "#fff",
				fontSize: 12,
				// fontFamily: 'Microsoft YaHei'
			},
		},
	},

	yAxis: {
		type: "value",
		axisLine: {
			show: true,
			lineStyle: {
				color: "rgba(95, 90, 79, 1)",
			},
		},
		axisTick: {
			show: false,
		},
		splitLine: {
			show: false,
		},
		axisLabel: {
			// interval: 0,
			// rotate: 40,
			textStyle: {
				color: "#fff",
				fontFamily: "D-DIN",
				fontSize: 14,
				// fontFamily: 'Microsoft YaHei'
			},
		},
	},
	series: [
		{
			name: "紧急",
			type: "bar",
			barWidth: "12%",
			itemStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: "rgba(250, 91, 41, 0.8)",
						},
						{
							offset: 1,
							color: "rgba(250, 91, 41, 0)",
						},
					]),
					borderWidth: 2,
					borderColor: "rgba(250, 91, 41, 0.8)",
					barBorderRadius: [12, 12, 0, 0],
				},
			},
			data: data.map((i) => i.criticalRiskNum),
		},
		{
			name: "高危",
			type: "bar",
			barWidth: "12%",
			itemStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: "rgba(255, 138, 31, 0.8)",
						},
						{
							offset: 1,
							color: "rgba(255, 138, 31, 0)",
						},
					]),
					borderWidth: 2,
					borderColor: "rgba(255, 138, 31, 0.8)",
					barBorderRadius: [12, 12, 0, 0],
				},
			},
			data: data.map((i) => i.highRiskNum),
		},
		{
			name: "中危",
			type: "bar",
			barWidth: "12%",
			itemStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: "rgba(253, 199, 59, 0.8)",
						},
						{
							offset: 1,
							color: "rgba(253, 199, 59, 0)",
						},
					]),
					borderWidth: 2,
					borderColor: "rgba(253, 199, 59, 0.8)",
					barBorderRadius: [12, 12, 0, 0],
				},
			},
			data: data.map((i) => i.mediumRiskNum),
		},
		{
			name: "低危",
			type: "bar",
			barWidth: "12%",
			itemStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: "rgba(224, 226, 111, 0.8)",
						},
						{
							offset: 1,
							color: "rgba(224, 226, 111, 0)",
						},
					]),
					borderWidth: 2,
					borderColor: "rgba(224, 226, 111, 0.8)",
					barBorderRadius: [12, 12, 0, 0],
				},
			},
			data: data.map((i) => i.lowRiskNum),
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
					width: "496px",
					height: "319px",
					border: "1px solid #fff",
					// background: "#171b19",
				},
				ref: (elem) => (elemRef.value = elem),
			});
	},
};
</script>
