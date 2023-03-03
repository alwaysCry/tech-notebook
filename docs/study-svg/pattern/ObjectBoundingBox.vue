<template>
	<svg width="240" height="160">
		<defs>
			<!-- pattern 的宽高均为 1，表示与被附加元素尺寸相等 -->
			<!-- 此时一个元素刚好仅容纳一个 pattern -->
			<pattern id="p2" patternUnits="objectBoundingBox" width="1" height="1">
				<rect width="30" height="30" fill="#f99" x="0" y="0" />
			</pattern>
		</defs>
		<circle
			cx="180"
			cy="80"
			r="50"
			stroke="#0a0"
			stroke-width="2"
			fill="url(#p2)"
		/>
		<rect
			width="100"
			height="100"
			x="10"
			y="30"
			stroke="#000"
			stroke-width="2"
			fill="url(#p2)"
		/>
	</svg>
</template>
