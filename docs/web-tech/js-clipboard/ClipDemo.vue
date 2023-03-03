<script>
import { h } from "vue";

function copy() {
	const text = "被复制的内容:铭记carousel0310";

	if (navigator.clipboard) {
		navigator.clipboard.writeText(text);
		return;
	}

	const textarea = document.createElement("textarea");
	document.body.appendChild(textarea);
	textarea.style.position = "fixed";
	textarea.style.clip = "rect(0,0,0,0)";
	textarea.style.top = "10px";

	textarea.value = text;
	textarea.select();
	document.execCommand("copy", true);
	document.body.removeChild(textarea);
}

export default {
	setup() {
		return () =>
			h("div", [
				h(
					"button",
					{
						onClick: copy,
						style: { display: "block", marginBottom: "10px" },
					},
					"点击按钮复制"
				),
				h("textarea", { placeholder: "粘贴到这里测试" }),
			]);
	},
};
</script>
