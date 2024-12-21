<script>
	import { draggable, events, position } from '@neodrag/svelte';

	let pos = $state({ x: 0, y: 0 });
</script>

<div
	use:draggable={[
		events({
			onDrag: ({ offset }) => {
				pos.x = offset.x;
				pos.y = offset.y;
			},
		}),
		position({
			current: $state.snapshot(pos),
		}),
	]}
>
	I can be moved with the slider too
</div>
X:
<input type="range" min="0" max="300" bind:value={pos.x} />
Y:
<input type="range" min="0" max="300" bind:value={pos.y} />
