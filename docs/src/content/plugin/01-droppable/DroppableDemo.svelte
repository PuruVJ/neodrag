<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { Droppable } from '@neodrag/svelte/drop';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// A chip carries `dragData`; the bin `accepts` it and reacts via `isOver` + `onDrop`.
	let pos = $state({ x: 0, y: 0 });
	let status = $state('drag the chip into the bin');
	const drag = new Draggable({
		dragData: { kind: 'chip' },
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
	const bin = new Droppable({
		accepts: ({ data }) => (data as { kind?: string })?.kind === 'chip',
		onDrop: () => (status = 'dropped ✓'),
	});

	function reset() {
		pos = { x: 0, y: 0 };
		status = 'drag the chip into the bin';
	}
</script>

<DocDemo label="Drop the chip in the bin" hint="bin reacts via isOver; accepts gates it" {reset}>
	{#snippet stage()}
		<div class="dz-row">
			<button class="dz-chip" {...drag.attach} aria-label="Draggable chip">chip</button>
			<div class="dz-bin" class:is-over={bin.isOver} {...bin.attach}>{status}</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.dz-row {
		display: flex;
		align-items: center;
		gap: 3rem;
	}
	.dz-chip {
		display: grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		font: 700 0.8rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
		z-index: 2;
	}
	.dz-bin {
		display: grid;
		place-items: center;
		width: 8rem;
		height: 6rem;
		padding: 0.5rem;
		text-align: center;
		font: 500 0.72rem/1.4 var(--app-font-mono);
		color: var(--color-fg-muted);
		background: transparent;
		border: 2px dashed var(--color-border-strong);
		border-radius: 12px;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease,
			color 0.15s ease;
	}
	.dz-bin.is-over {
		color: var(--color-fg);
		border-color: var(--color-brand);
		border-style: solid;
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 12%);
	}
</style>
