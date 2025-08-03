<script lang="ts">
	// https://github.com/PuruVJ/neodrag/discussions/232#discussioncomment-13958150
	import { Compartment, draggable, events, position, threshold } from '@neodrag/svelte';

	let x = $state(0);
	let y = $state(30);

	const positionComp = Compartment.of(() => position({ current: { x, y } }));

	const dragAttachment = draggable(() => [
		positionComp,
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

	div {
		cursor: default;
		position: absolute;
		z-index: 1;
		background: white;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
	}

	p {
		margin: 0;
	}

	p.drag {
		font-weight: bold;
		color: red;
	}

	p.bottom-right {
		position: fixed;
		bottom: 0;
		right: 15px;
		width: 200px;
		text-align: right;
	}
</style>
