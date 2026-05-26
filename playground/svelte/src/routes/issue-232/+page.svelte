<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { events, position } from '@neodrag/svelte/plugins';

	let x = $state(0);
	let y = $state(300);

	const drag = new Draggable({
		plugins: [
			() => position({ current: { x, y } }),
			events({
				onDrag: (data) => {
					x = data.offset.x;
					y = data.offset.y;
				},
			}),
		],
		threshold: {
			distance: 0,
			delay: 0,
		},
	});
</script>

<main>
	<div {@attach drag.attachment} class="drag">
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

	.drag {
		width: 100px;
		height: 100px;
		background: cyan;
		position: absolute;
	}
</style>
