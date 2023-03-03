<script>
import * as PIXI from "pixi.js";
import { h, onMounted, ref } from "vue";
import sample from "./assets/sample.png";

const app = new PIXI.Application({
	width: 360,
	height: 360,
	backgroundColor: 0x1099bb,
	resolution: window.devicePixelRatio || 1,
});

const container = new PIXI.Container();
app.stage.addChild(container);

const texture = PIXI.Texture.from(
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAlCAYAAABcZvm2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWNJREFUeNrsV8sNwjAMbUqBBWACxB2pQ8AKcGALTsAJuDEFB1gBhuDAuWICmICPQh01pXWdJqEFcaglRGRbfonjPLuMc+5QwhjLGEJfZusjxZOL9akZKye9G98vPMfvsAx4qBfKwfzBL9s6uUHpI6U/u7+BKGkNb/H6umtk7MczF0HyfKS4zo/k/4AgTV8DOizrqX8oECgC+MGa8lGJp9sJDiAB8nyqYoglvJOPbP97IqoATGxWVZeXJlMQwYHA3piF8wJIblOVNBBxe3TPMLoHIKtxrbS7AAbBrA4Y5NaPAXf8LjN6wKZ0RaZOnlAFZnuXInVR4FTE6eYp0olPhhshtXsAwY3PquoAJNkIY33U7HTs7hYBwV24ItUKqDwgKF3VzAZ6k8HF+B1BMF8xRJbeJoqMXHZAAQ1kwoluURCdzepEugGEImBrIADB7I4lyfbJLlw92FKE6b5hVd+ktv4vAQYASMWxvlAAvcsAAAAASUVORK5CYII="
);

for (let i = 0; i < 25; i++) {
	const bunny = new PIXI.Sprite(texture);
	bunny.anchor.set(0.5);
	bunny.x = (i % 5) * 40;
	bunny.y = Math.floor(i / 5) * 40;
	container.addChild(bunny);
}

container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

app.ticker.add((delta) => {
	container.rotation -= 0.01 * delta;
});

export default {
	setup() {
		const containerRef = ref(null);

		onMounted(() => {
			containerRef.value.appendChild(app.view);

			// let elapsed = 0;
			// app.ticker.add((delta) => {
			// 	elapsed += delta;
			// 	sprite.x = 100 + Math.cos(elapsed / 50) * 100;
			// });
		});

		return () =>
			h("div", { ref: (elem) => (containerRef.value = elem) });
	},
};
</script>
