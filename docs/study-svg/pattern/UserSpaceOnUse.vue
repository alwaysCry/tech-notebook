<template>
	<svg width="240" height="160">
		<defs>
			<pattern id="p1" patternUnits="userSpaceOnUse" width="60" height="60">
				<!-- pattern 内元素若超出 pattern 尺寸范围，将被裁剪-->
				<rect width="40" height="30" fill="#f99" x="40" y="0"></rect>
			</pattern>
		</defs>
		<!-- 注意以下三个元素的 pattern 完全重合 -->
		<!-- 因 userSpaceOnUse 以 SVG 根元素左上角为基准点 -->
		<rect width="240" height="160" stroke="red" fill="url(#p1)" />
		<circle cx="150" cy="80" r="50" stroke="#000" fill="url(#p1)" />
		<rect
			width="60"
			height="60"
			x="1"
			y="1"
			stroke="#00f"
			stroke-width="2"
			fill="url(#p1)"
		/>
	</svg>
</template>
