<!-- DragTest.svelte -->
<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { bounds, BoundsFrom } from '@neodrag/svelte/plugins';

	const drag_0 = new Draggable({
		plugins: [],
		onDrag: (e) => console.log('HTML drag:', e.offset),
	});
	const drag_1 = new Draggable({ plugins: [bounds(BoundsFrom.parent())] });
	const drag_2 = new Draggable({
		plugins: [],
		onDrag: (e) => console.log('SVG drag:', e.offset),
	});
</script>

<div class="container">
	<!-- HTML Element -->
	<div {...drag_0.target} class="draggable-div">Drag me (HTML)</div>

	<!-- SVG Elements -->
	<svg width="400" height="400" viewBox="0 0 400 400">
		<circle {...drag_1.target} cx="100" cy="100" r="50" fill="blue" opacity="0.5" />
		<rect
			{...drag_2.target}
			x="200"
			y="200"
			width="80"
			height="80"
			fill="green"
			opacity="0.5"
		/>
	</svg>
</div>

<style>
	.container {
		padding: 2rem;
	}

	.draggable-div {
		width: 100px;
		height: 100px;
		background: coral;
		cursor: grab;
	}
</style>
