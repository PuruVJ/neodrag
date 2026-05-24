<!-- DragTest.svelte -->
<script lang="ts">
	import { Draggable } from '@neodrag/svelte'
	import { bounds, BoundsFrom, events } from '@neodrag/svelte/plugins';

	const drag_0 = new Draggable({ plugins: [
			events({
				onDrag: (e) => console.log('HTML drag:', e.offset),
			}),
		] });
	const drag_1 = new Draggable({ plugins: [bounds(BoundsFrom.parent())] });
	const drag_2 = new Draggable({ plugins: [
				events({
					onDrag: (e) => console.log('SVG drag:', e.offset),
				}),
			] });
</script>

<div class="container">
	<!-- HTML Element -->
	<div
		{@attach drag_0.attachment}
		class="draggable-div"
	>
		Drag me (HTML)
	</div>

	<!-- SVG Elements -->
	<svg width="400" height="400" viewBox="0 0 400 400">
		<circle
			{@attach drag_1.attachment}
			cx="100"
			cy="100"
			r="50"
			fill="blue"
			opacity="0.5"
		/>
		<rect
			{@attach drag_2.attachment}
			x="200"
			y="200"
			width="100"
			height="100"
			fill="red"
			opacity="0.5"
		/>
	</svg>
</div>

<style>
	.container {
		width: 100%;
		height: 100vh;
		background: #f0f0f0;
		position: relative;
	}

	.draggable-div {
		position: absolute;
		top: 50px;
		left: 50px;
		width: 100px;
		height: 100px;
		background: #4caf50;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: grab;
		user-select: none;
		border-radius: 8px;
		padding: 8px;
		text-align: center;
	}

	.draggable-div:active {
		cursor: grabbing;
	}

	svg {
		border: 1px solid #ccc;
		background: white;
	}

	circle,
	rect {
		cursor: grab;
	}

	circle:active,
	rect:active {
		cursor: grabbing;
	}
</style>
