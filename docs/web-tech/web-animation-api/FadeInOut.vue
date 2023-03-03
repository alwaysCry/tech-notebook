<script>
import { h, onMounted, ref } from "vue";

function animate(element) {
	element.animate(
		[
			{ opacity: 0 },
			{ opacity: 1, offset: 0.4 },
			{ opacity: 0 },
		],
		{
			duration: 3000,
			delay: 0,
			fill: "forwards",
			easing: "steps(8, end)",
			iterations: Infinity,
		}
	);
}

export default {
	setup() {
		const elemRef = ref(null);

		onMounted(() => {
			animate(elemRef.value);
		});

		return () =>
			h("div", {
				class: "circle",
				ref: (elem) => (elemRef.value = elem),
			});
	},
};
</script>

<style scoped>
.circle {
	width: 158px;
	height: 158px;
	background: red;
	border-radius: 50%;
}
</style>
