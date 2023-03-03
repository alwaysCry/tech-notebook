<template>
	<!-- <div></div> -->
	<i class="ahc-icon" :style="{ '--background-image': base64Url }"></i>
	<i class="ahc-icon" :style="{ '--background-image': rawStrUrl }"></i>
</template>

<script setup>
import { onMounted, ref } from "vue";

const svgStr = `<svg width="160px" height="160px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>我的已办1_to-do1</title>
    <g id="Icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="安恒云1-（130个）" transform="translate(-70.000000, -80.000000)">
            <g id="我的已办1_to-do1" transform="translate(70.000000, 80.000000)">
                <rect id="矩形备份-257" fill="#D8D8D8" opacity="0" x="0" y="0" width="16" height="16"></rect>
                <g id="编组-68" transform="translate(2.000000, 1.000000)">
                    <path d="M10.9236111,0 C11.4720606,0 11.9166667,0.450380222 11.9166667,1.00595238 L11.9169611,6.72974591 C11.1246834,6.04648047 10.0928812,5.63333333 8.96458333,5.63333333 C6.46664543,5.63333333 4.44166667,7.6583121 4.44166667,10.15625 C4.44166667,11.8377686 5.35928172,13.3049666 6.72108017,14.0844126 L0.993055556,14.0833333 C0.444606116,14.0833333 0,13.6329531 0,13.077381 L0,1.00595238 C0,0.450380222 0.444606116,0 0.993055556,0 L10.9236111,0 Z" id="形状结合" fill="#337DFF"></path>
                    <rect id="矩形备份-130" fill="#BAD1FF" x="1.625" y="1.625" width="7.58333333" height="1.08333333" rx="0.541666667"></rect>
                    <rect id="矩形备份-131" fill="#BAD1FF" x="1.625" y="4.875" width="4.33333333" height="1.08333333" rx="0.541666667"></rect>
                    <rect id="矩形备份-132" fill="#BAD1FF" x="1.625" y="8.125" width="2.54583333" height="1.08333333" rx="0.541666667"></rect>
                    <g id="编组-27" transform="translate(5.416667, 6.500000)">
                        <circle id="椭圆形备份-15" fill="#BAD1FF" cx="3.79166667" cy="3.79166667" r="3.79166667"></circle>
                        <path d="M6.18829789,1.94499692 C6.42966891,2.12172634 6.48207128,2.46066372 6.30534186,2.70203475 L4.21673784,5.55457897 C3.89987162,5.98734406 3.29800834,6.09305039 2.85263979,5.79415796 L1.31643555,4.76319198 C1.06803505,4.59648729 1.00180752,4.25997805 1.16851221,4.01157756 C1.33521641,3.7631778 1.67172466,3.69695047 1.92012441,3.86365467 C1.92012486,3.86365496 1.9201253,3.86365526 1.92012574,3.86365556 L3.38983122,4.84999968 L3.38983122,4.84999968 L5.43125004,2.06203356 C5.60798618,1.82066497 5.94692524,1.76826632 6.18829789,1.94499692 Z" id="路径-23备份" fill="#337DFF" fill-rule="nonzero"></path>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>`;

const rawStrUrl = `url('data:image/svg+xml,${encodeURIComponent(svgStr)}')`;

const blob = new Blob([svgStr], { type: "image/svg+xml" });
const reader = new FileReader();
const base64Url = ref("");
onMounted(() => {
	reader.readAsDataURL(blob);
	reader.onload = () => {
		base64Url.value = `url('${reader.result}')`;
	};
});
</script>

<style scoped>
.ahc-icon {
	display: inline-block;
	width: 48px;
	height: 48px;
	background: var(--background-image) no-repeat center;
	background-size: 100% 100%;
}
</style>
