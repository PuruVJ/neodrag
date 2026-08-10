<script lang="ts">
	import { Draggable, type Axis } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	let axis = $state<Axis>('both');
	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		bounds: 'parent',
		get axis() {
			return axis;
		},
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
</script>

<DocDemo label="axis — lock movement to one direction" reset={() => (pos = { x: 0, y: 0 })}>
	{#snippet controls()}
		<span>axis:</span>
		{#each ['x', 'y', 'both'] as const as a (a)}
			<button type="button" aria-pressed={axis === a} onclick={() => (axis = a)}>{a}</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<button class="db" {...drag.attach}>{axis}</button>
	{/snippet}
</DocDemo>

<style>
	.db {
		display: grid;
		place-items: center;
		width: 5rem;
		height: 5rem;
		font: 700 0.82rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
	}
</style>
