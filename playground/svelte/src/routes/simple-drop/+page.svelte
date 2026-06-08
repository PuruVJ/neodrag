<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { Droppable } from '@neodrag/svelte/drop';

	let dragCount = $state(0);
	let dropCount = $state(0);

	const drag = new Draggable({
		plugins: [
			{
				start() {
					dragCount++;
				},
			},
		],
	});

	const drop = new Droppable({
		plugins: [
			{
				onDrop() {
					dropCount++;
				},
			},
		],
	});
</script>

<div class="container">
	<h1>Simple Drag and Drop Test</h1>

	<div class="box draggable" {...drag.target}>
		Drag me (dragged {dragCount} times)
	</div>

	<div class="box drop-zone" {...drop.zone}>
		Drop here (dropped {dropCount} times)
	</div>
</div>

<style>
	.container {
		padding: 2rem;
	}

	.box {
		width: 200px;
		height: 100px;
		margin: 2rem;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
	}

	.draggable {
		background: #3b82f6;
		color: white;
		cursor: move;
	}

	.drop-zone {
		background: #f3f4f6;
		border: 2px dashed #d1d5db;
	}
</style>
