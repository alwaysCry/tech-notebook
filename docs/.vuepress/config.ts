import { defineUserConfig, viteBundler } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { path } from "@vuepress/utils";
import mk from "@iktakahiro/markdown-it-katex";

export default defineUserConfig({
	bundler: viteBundler({
		viteOptions: {
			assetsInclude: ["**/*.csv", "**/*.awebp"],
		},
	}),
	theme: defaultTheme({
		sidebar: [
			"/temp-note",
			"/common-handwriting-function",
			{
				text: "数据结构与算法",
				collapsible: true,
				children: ["/algorithm/data-structure"],
			},
			{
				text: "计算机网络",
				collapsible: true,
				children: [
					"/network/cookie",
					"/network/http-cache",
					"/network/tcp",
					"/network/http2",
				],
			},
			{
				text: "面试題集錦",
				collapsible: true,
				children: [
					"/interview/swr",
					"/interview/continuous-range",
					"/interview/foundation-collection",
					"/interview/async-collection",
					"/interview/network-collection",
					"/interview/algorithm-collection",
					"/interview/program-collection",
					"/interview/dev-collection",
					"/interview/sorting-algorithm",
					"/interview/es5-es6-extend",
					"/interview/deep-copy",
				],
			},
			{
				text: "项目工程化",
				collapsible: true,
				children: [
					"/projection/packagejson",
					"/projection/git",
					"/projection/tools-compare",
					"/projection/postcss",
					"/projection/overview",
					"/projection/ts-collection",
				],
			},
			{
				text: "生产力/调试工具及技术",
				collapsible: true,
				children: [
					"/debug/curl",
					"/debug/chrome-debug-skill",
					"/debug/vscode-web-debugger",
					"/debug/chrome-devtool-debug-android",
					"/debug/chrome-devtool-extra-function",
				],
			},
			{
				text: "JavaScript Info 摘录",
				collapsible: true,
				children: [
					"/javascript-info/variable",
					"/javascript-info/primitive",
					"/javascript-info/object-basis",
					"/javascript-info/object-advanced",
					"/javascript-info/basic-operation",
					"/javascript-info/function",
					"/javascript-info/async",
					"/javascript-info/json",
					"/javascript-info/form-controls",
					"/javascript-info/style-and-class",
					"/javascript-info/size-and-scroll",
					"/javascript-info/coordinate",
					"/javascript-info/mouse-event-basic",
					"/javascript-info/keyboard-event",
					"/javascript-info/websocket",
					"/javascript-info/web-lifecycle",
					"/javascript-info/load-resource",
					"/javascript-info/module",
					"/javascript-info/binary",
					"/javascript-info/formdata",
					"/javascript-info/fetch",
					"/javascript-info/try-catch-error",
					"/javascript-info/promise",
					"/javascript-info/property-descriptor-accessor",
					"/javascript-info/prototype",
					"/javascript-info/class",
				],
			},
			{
				text: "How Javascript Works 摘录",
				children: [
					"/how-javascript-works/overview.md",
					"/how-javascript-works/memory.md",
				],
				collapsible: true,
			},
			{
				text: "Web技术综合",
				collapsible: true,
				children: [
					"/web-tech/web-animation-api",
					"/web-tech/js-url-urlsearchparams",
					"/web-tech/download-attribute",
					"/web-tech/web-notification",
					"/web-tech/dom-api-html-encode-decode",
					"/web-tech/js-clipboard",
					"/web-tech/file-system-access-api",
					"/web-tech/page-visibility",
				],
			},
			{
				text: "Web技巧综合",
				collapsible: true,
				children: [
					"/web-skill/svg-symbol-sprites",
					"/web-skill/css-inline-svg",
				],
			},
			{
				text: "Web框架",
				collapsible: true,
				children: [
					{
						text: "Vue2 全解析",
						children: [
							"/framework/vue2-analysis/project-overview",
							"/framework/vue2-analysis/render-overview",
							"/framework/vue2-analysis/componentization",
						],
					},
					"/framework/vue2-diff",
					"/framework/vue3-reactive",
					"/framework/react-overview",
					"/framework/react-diff",
					"/framework/vue-react-key",
				],
			},
			{
				text: "SVG研究之路",
				collapsible: true,
				children: ["/study-svg/pattern"],
			},
			{
				text: "可视化技术综合",
				collapsible: true,
				children: [
					"/visual-tech/world-map",
					"/visual-tech/pixi-demos",
					{
						text: "Echarts 实例",
						children: [
							"/visual-tech/echarts-examples/line",
							"/visual-tech/echarts-examples/pie",
							"/visual-tech/echarts-examples/bar",
						],
					},
				],
			},
			{
				text: "技术储备",
				collapsible: true,
				children: [
					"/tech-reserve/pan-zoom-tech",
					"/tech-reserve/html5-indexeddb",
				],
			},
			{
				text: "服务端",
				collapsible: true,
				children: [
					"/server/node-basis",
					"/server/node-multi-thread",
					"/server/node-debugger",
					"/server/node-process",
					"/server/node-stream",
					{
						text: "Express 相关",
						children: [
							"/server/express/middleware",
							"/server/express/routing",
							"/server/express/error-handle",
						],
					},
					{
						text: "开发工具",
						children: ["/server/devtool/nodemon"],
					},
				],
			},
			{
				text: "DevOps",
				collapsible: true,
				children: [
					{
						text: "Docker",
						children: [
							"/devops/docker/conception",
							"/devops/docker/image",
							"/devops/docker/overview",
							"/devops/docker/basic-ops",
							"/devops/docker/registry",
							"/devops/docker/network",
							"/devops/docker/dockerfile",
						],
					},
				],
			},
		],
	}),
	plugins: [
		registerComponentsPlugin({
			componentsDir: path.resolve(__dirname, "../"),
			getComponentName: (filename) => {
				let matchResult = filename.match(/\w+(?=\.vue)/);
				if (!matchResult)
					throw new Error(`提取自定义组件：${filename}名称失败`);

				let componentName = matchResult[0];
				if (componentName !== "index") return componentName;

				matchResult = filename.match(/\w+(?=\/\w+\.vue)/);
				if (!matchResult)
					throw new Error(`提取自定义组件：${filename}名称失败`);
				componentName = matchResult[0];

				return componentName;
			},
		}),
		{
			name: "@alwaysCry/vuepress-latex-plugin",
			extendsMarkdown(md) {
				md.use(mk);
				// md.linkify.set({ fuzzyEmail: false });
			},
			extendsPage: (options) => {
				options.frontmatter.head = [
					[
						"link",
						{
							rel: "stylesheet",
							href: "https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css",
						},
					],
				];
			},
			extendsBundlerOptions: (options) => {
				options.vuePluginOptions = {
					template: {
						compilerOptions: {
							isCustomElement: (tag) => {
								const customElement = ["eannotation", "semantics"];
								return tag[0] === "m" || customElement.includes(tag);
							},
						},
					},
				};
				// .template.compilerOptions.isCustomElement =isCustomElement;
			},
		},
	],
});
