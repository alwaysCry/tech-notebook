<script>
import { h, ref } from "vue";

const src = ref("");

async function openFile() {
	const fileHandles = await showOpenFilePicker({
		multiple: true,
		types: [
			{
				description: "Images",
				accept: {
					"image/*": [".png", ".gif", ".jpeg", ".jpg", ".webp"],
				},
			},
		],
	});

	for (const fileHandle of fileHandles) {
		// 获取文件内容
		const fileData = await fileHandle.getFile();
		// 读取文件数据
		const buffer = await fileData.arrayBuffer();
		// 转成 blob url
		src.value = URL.createObjectURL(new Blob([buffer]));
	}
}

export default {
	setup() {
		return () => [
			h(
				"button",
				{
					onClick: openFile,
				},
				"选择文件"
			),
			h("img", {
				src: src.value,
				style: { display: "block", maxWidth: "500px", maxHeight: "300px" },
			}),
		];
	},
};
</script>
