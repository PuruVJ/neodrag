<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Two-way `position` so `reset` can snap the box home without re-creating the instance (the
	// constructor runs `$effect`, which can't be called from an event handler). Reads live `offset`.
	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		bounds: 'parent',
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
</script>

<DocDemo label="A draggable, bounded to the stage" hint="reads back live offset" reset={() => (pos = { x: 0, y: 0 })}>
	{#snippet stage()}
		<button class="dd-box" class:is-dragging={drag.isDragging} {...drag.attach} aria-label="Draggable box">
			{drag.isDragging ? `${Math.round(drag.offset.x)}, ${Math.round(drag.offset.y)}` : 'drag me'}
		</button>
	{/snippet}
</DocDemo>

<style>
	.dd-box {
		display: grid;
		place-items: center;
		width: 6.5rem;
		height: 6.5rem;
		padding: 0;
		font: 700 0.82rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 14px;
		cursor: grab;
		touch-action: none;
		box-shadow: 0 10px 24px -14px color-mix(in lch, var(--color-fg), transparent 30%);
		transition: box-shadow 0.15s ease;
	}
	.dd-box.is-dragging {
		cursor: grabbing;
		box-shadow: 0 18px 34px -16px color-mix(in lch, var(--color-fg), transparent 20%);
	}
</style>
