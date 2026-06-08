<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { position } from '@neodrag/svelte/plugins';

	let x = $state(0);
	let y = $state(300);

	const drag = new Draggable({
		plugins: [() => position({ current: { x, y } })],
		onDrag: (data) => {
			x = data.offset.x as number;
			y = data.offset.y as number;
		},
		threshold: {
			distance: 0,
			delay: 0,
		},
	});
</script>

<main>
	<div {...drag.target} class="drag">
		<p class="drag">DRAG</p>
	</div>
	<button
		onclick={() => {
			x += 10;
		}}
	>
		Move X
	</button>
</main>

<style>
	main {
		height: 200vh;
	}
</style>
