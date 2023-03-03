<script>
import { h, ref } from "vue";

export default {
	setup() {
		const inputRef = ref(null);

		const handleBlur = () => {
			const input = inputRef.value;
			if (input.value.includes("@")) {
				input.classList.remove("error");
				return;
			}

			input.classList.add("error");
			input.focus();
		};

		return () => [
			h("div", [
				"请输入带@的值：",
				h("input", {
					type: "email",
					ref: (elem) => (inputRef.value = elem),
					onBlur: handleBlur,
				}),
			]),
			h("div", ["下一个input：", h("input")]),
		];
	},
};
</script>

<style scoped>
.error {
	background: red;
}
</style>
