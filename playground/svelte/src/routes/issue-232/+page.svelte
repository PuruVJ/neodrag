<script lang="ts">
	import { draggable, events, position, threshold } from '@neodrag/svelte';

	let x = $state(0);
	let y = $state(300);

	const dragAttachment = draggable(() => [
		position({ current: { x, y } }),
		threshold({
			distance: 0,
			delay: 0,
		}),
		events({
			onDrag: (data) => {
				x = data.offset.x;
				y = data.offset.y;
			},
		}),
	]);
</script>

<main>
	<div {@attach dragAttachment} class="drag">
		<p class="drag">DRAG</p>
	</div>
	<button
		onclick={() => {
			// selected = false;
		}}>position: {x} {y}</button
	>
	<p class="bottom-right">drag over here then do very small drags successively</p>
</main>

<style>
	main {
		position: relative;
	}

	.drag {
		width: 100px;
		height: 100px;
		background-color: cyan;
		position: absolute;
		top: 0;
		left: 0;
	}

	.bottom-right {
		position: absolute;
		bottom: 0;
		right: 0;
	}
</style>
