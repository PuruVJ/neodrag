<script>
	import { Draggable } from '@neodrag/svelte'
	import { events, position } from '@neodrag/svelte/plugins';

	let pos = $state({ x: 0, y: 0 });

	const drag_0 = new Draggable({ plugins: [() => [
		events({
			onDrag: ({ offset }) => {
				pos.x = offset.x;
				pos.y = offset.y;
			},
		}),
		position({ current: pos }),
	]] });
</script>

<div
	{@attach drag_0.attachment}
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
