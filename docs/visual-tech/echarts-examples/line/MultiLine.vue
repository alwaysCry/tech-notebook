<script>
import { h, onMounted, ref } from "vue";
import * as echarts from "echarts";

/*

function getDivisors(n) {
	// divisor 因子/分流器
	const divisors = [1];
	if (n === 1) return divisors;
	divisors.push(n);
	const sqrt = Math.sqrt(n);
	for (let i = 2; i < sqrt; i++) {
		if (n % i !== 0) continue;
		divisors.push(i);
		divisors.push(n / i);
	}
	if (sqrt ** 2 === n && Math.round(sqrt) === sqrt) divisors.push(sqrt);
	return divisors.sort((i, j) => j - i);
}

function sample(arr, step) {
	if (step === 1) return arr;

	const l = arr.length;
	const divisors = getDivisors(l - 1); // 这里假设 divisors 已经排序
	const approximation = divisors.find((d) => d <= step);

	if (approximation === 1) return arr;
	const sample = [];
	for (let i = 0; i <= arr.length; i += approximation) {
		sample.push(arr[i]);
	}
	return sample;
}


*/

let data = {
	data: {
		points: [
			"2022-09-24",
			"2022-09-25",
			"2022-09-26",
			"2022-09-27",
			"2022-09-28",
			"2022-09-29",
			"2022-09-30",
			"2022-10-01",
			"2022-10-02",
			"2022-10-03",
			"2022-10-04",
			"2022-10-05",
			"2022-10-06",
			"2022-10-07",
			"2022-10-08",
			"2022-10-09",
			"2022-10-10",
			"2022-10-11",
			"2022-10-12",
			"2022-10-13",
			"2022-10-14",
			"2022-10-15",
			"2022-10-16",
			"2022-10-17",
			"2022-10-18",
			"2022-10-19",
			"2022-10-20",
			"2022-10-21",
			"2022-10-22",
			"2022-10-23",
			"2022-10-24",
		],
		details: {
			主机安全: [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 30, 0, 1, 0,
			],
			WEB应用防火墙: [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 14, 0, 8, 0,
			],
			EDR扫描: [
				22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0,
			],
		},
	},
};

data = data.data;

const xData = data.points;
const totalData = data.points.map((_, index) => {
	const values = Object.values(data.details);
	return values.reduce((acc, cur) => acc + cur[index], 0);
});
const yData = Object.entries(data.details)
	.map((i) => ({
		name: i[0],
		data: i[1],
	}))
	.concat([
		{
			name: "聚合",
			data: totalData,
		},
	]);

const tooltipFormatter = yData
	.slice(0, -1)
	.map((_, i) => `{a${i * 2}}: {c${i * 2}}`)
	.join("<br/>");

const option = {
	// backgroundColor: "#0c0e1a",
	grid: {
		top: "30%",
		bottom: "30%",
		left: "10%",
		right: "10%",
	},
	tooltip: {
		trigger: "axis",
		formatter: tooltipFormatter,
		axisPointer: {
			type: "shadow",
			label: {
				show: true,
			},
		},
	},
	xAxis: {
		type: "category",
		data: xData,
		// minInterval: 10,
		offset: 15,
		axisLine: {
			show: false,
		},
		axisTick: {
			show: false,
		},
		axisLabel: {
			interval: 0, // 不考虑间隔，所有坐标轴标签都将展示
			textStyle: {
				fontSize: 10,
				interval: 10,
				color: "#FFFFFF",
			},
		},
	},
	yAxis: {
		show: false,
	},
	dataZoom: [
		{
			type: "slider",
			xAxisIndex: [0],
			filterMode: "filter",
			maxValueSpan: 8,
			zoomLock: true,
			brushSelect: false,
			handleSize: "0%",
			height: 15,
			showDetail: false,
			// moveHandleSize: 20,
		},
	],
	series: yData
		.map(({ name, data }, index) => [
			{
				name,
				type: index === yData.length - 1 ? "line" : "custom",
				renderItem: index === yData.length - 1 ? undefined : () => {},
				symbol: "circle",
				symbolSize: 6,
				showSymbol: true,
				itemStyle: {
					color: "#0791F6",
					borderWidth: 6,
					borderColor: "rgba(7,145,246,0.37)",
				},
				label: {
					show: true,
					fontSize: 20,
					fontFamily: "D-DIN",
					position: "top",
					distance: 14,
					color: "#80D5FF",
				},
				lineStyle: {
					color: "#0791F6",
				},
				data,
			},
			{
				type: index === yData.length - 1 ? "line" : "custom",
				renderItem: index === yData.length - 1 ? undefined : () => {},
				showSymbol: true,
				symbol: "circle",
				symbolSize: 1,
				itemStyle: {
					color: "transparent",
					borderWidth: 20,
					borderColor: "rgba(255,255,255,0.6)",
				},
				lineStyle: {
					color: "transparent",
				},
				data,
			},
		])
		.flat(),
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
					width: "787px",
					height: "292px",
				},
				ref: (elem) => (elemRef.value = elem),
			});
	},
};
</script>

<!-- 


	const xData = data.points;
const yData = Object.entries(data.details).map((i) => ({
  name: i[0],
  data: i[1],
}));

const tooltipFormatter = yData.map((_, i) => `{a${i * 2}}: {c${i * 2}}`).join("<br/>");

const option = {
  // backgroundColor: "#0c0e1a",
  grid: {
    top: "30%",
    bottom: "30%",
    left: "10%",
    right: "10%",
  },
  tooltip: {
    trigger: "axis",
    formatter: tooltipFormatter,
    axisPointer: {
      type: "shadow",
      label: {
        show: true,
      },
    },
  },
  xAxis: {
    type: "category",
    data: xData,
    // minInterval: 10,
    offset: 15,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      interval: 0, // 不考虑间隔，所有坐标轴标签都将展示
      textStyle: {
        fontSize: 10,
        interval: 10,
        color: "#FFFFFF",
      },
    },
  },
  yAxis: {
    show: false,
  },
  dataZoom: [{
    type: "slider",
    xAxisIndex: [0],
    filterMode: "filter",
    maxValueSpan: 4,
    zoomLock: true,
    brushSelect: false,
    handleSize: "0%",
    height: 15,
    showDetail: false,
    // moveHandleSize: 20,
  }, ],
  series: yData
    .map(({
      name,
      data
    }) => [{
        name,
        type: "line",
        symbol: "circle",
        symbolSize: 6,
        itemStyle: {
          color: "#0791F6",
          borderWidth: 6,
          borderColor: "rgba(7,145,246,0.37)",
        },
        label: {
          show: true,
          fontSize: 20,
          fontFamily: "D-DIN",
          position: "top",
          distance: 14,
          color: "#80D5FF",
          // formatter: "{c}",
          // fontWeight: "600",
        },
        lineStyle: {
          color: "#0791F6",
        },
        data,
      },
      {
        type: "line",
        symbol: "circle",
        symbolSize: 1,
        itemStyle: {
          color: "transparent",
          borderWidth: 20,
          borderColor: "rgba(255,255,255,0.6)",
        },
        lineStyle: {
          color: "transparent",
        },
        data,
      },
    ])
    .flat(),
}
 -->
