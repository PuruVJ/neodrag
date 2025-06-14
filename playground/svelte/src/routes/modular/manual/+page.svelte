<script>
	import { draggable, events, position, Compartment } from '@neodrag/svelte';

	let pos = $state({ x: 0, y: 0 });

	const position_compartment = Compartment.of(() => position({ current: $state.snapshot(pos) }));
</script>

<div
	{@attach draggable(() => [
		events({
			onDrag: ({ offset }) => {
				pos.x = offset.x;
				pos.y = offset.y;
			},
		}),
		position_compartment,
	])}
>
	I can be moved with the slider too
</div>
X:
<input type="range" min="0" max="300" bind:value={pos.x} />
Y:
<input type="range" min="0" max="300" bind:value={pos.y} />

<style>
	:global {
		body {
			margin: 0;
			padding: 0;
			display: flex;
			justify-content: center;
			align-items: center;

			height: 100vh;
		}
	}
</style>
