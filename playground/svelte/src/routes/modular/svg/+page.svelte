<!-- DragTest.svelte -->
<script lang="ts">
	import { draggable } from '@neodrag/svelte';
</script>

<div class="container">
	<!-- HTML Element -->
	<div use:draggable={[]} class="draggable-div">Drag me (HTML)</div>

	<!-- SVG Elements -->
	<svg width="400" height="400" viewBox="0 0 400 400">
		<circle use:draggable cx="100" cy="100" r="50" fill="blue" opacity="0.5" />
		<rect use:draggable={[]} x="200" y="200" width="100" height="100" fill="red" opacity="0.5" />
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
