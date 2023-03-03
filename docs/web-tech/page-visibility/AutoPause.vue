<script>
import { h, onMounted, ref } from "vue";

export default {
	setup() {
		const videoRef = ref(null);

		onMounted(() => {
			const video = videoRef.value;
			video.addEventListener(
				"timeupdate",
				() => {
					document.title = `第${Math.floor(video.currentTime)}秒`;
				},
				false
			);
			video.addEventListener(
				"pause",
				() => {
					if (!document.hidden) return;
					sessionStorage.pauseByVisibility = true;
				},
				false
			);
			video.addEventListener(
				"play",
				() => {
					sessionStorage.pauseByVisibility = false;
				},
				false
			);
			document.addEventListener("visibilitychange", () => {
				if (document.hidden) {
					video.pause();
				} else if (sessionStorage.pauseByVisibility) {
					video.play();
				}
			});
		});

		return () =>
			h("video", {
				ref: (elem) => (videoRef.value = elem),
				src: "https://www.zhangxinxu.com/study/media/cat2.mp4",
				width: 320,
				height: 240,
				controls: true,
				autoplay: true,
			});
	},
};
</script>
