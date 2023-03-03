<script>
import { h, ref } from "vue";
import mm from "./assets/mm.jpg";

const tip = ref("");

function popup() {
	if (Notification.permission !== "granted") return;

	const notification = new Notification("Hi，帅哥：", {
		body: "可以加你为好友吗？",
		icon: mm,
	});

	notification.onclick = () => {
		tip.value = `carousel小姐已于${
			new Date().toTimeString().split(" ")[0]
		}加你为好友！`;
		notification.close();
	};
}

function notify() {
	if (Notification.permission === "granted") {
		popup();
	}
	if (Notification.permission === "default") {
		Notification.requestPermission(popup);
	}
}

export default {
	setup() {
		return () =>
			h("div", [
				h(
					"button",
					{
						onClick: notify,
					},
					"有人想加你为好友"
				),
				h("p", tip.value),
			]);
	},
};
</script>
