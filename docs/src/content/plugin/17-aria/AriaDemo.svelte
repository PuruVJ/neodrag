<script lang="ts">
	import { Draggable, ariaDrag } from '@neodrag/svelte';
	import { keyboardDraggable } from '@neodrag/core/sensors';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `ariaDrag` announces a drag to an ARIA live region and marks the node grabbed — gated to keyboard
	// input (pointer drags are already visible). We pair it with the keyboard sensor and point its
	// liveRegion at the panel below so you can *see* what a screen reader would hear.
	let node = $state<HTMLElement>();
	let live = $state<HTMLElement>();
	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		bounds: 'parent',
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
		use: [ariaDrag({ label: 'Card', liveRegion: () => live ?? null, announce: true })],
	});

	$effect(() => {
		if (!node) return;
		const handle = keyboardDraggable(node, { grabKey: 'Space', step: 8 });
		return () => handle.destroy();
	});
</script>

<DocDemo
	label="Tab to the card, press Space to grab, arrow keys to move, Space to drop"
	hint="ariaDrag → live region"
	reset={() => (pos = { x: 0, y: 0 })}
>
	{#snippet stage()}
		<div class="ar-stage">
			<button bind:this={node} class="ar-card" {...drag.attach}>Card</button>
		</div>
	{/snippet}
</DocDemo>

<div class="ar-live" bind:this={live} role="status" aria-live="polite">live region — announcements appear here</div>

<style>
	.ar-stage {
		display: grid;
		place-items: center;
		width: 100%;
		height: 12rem;
	}
	.ar-card {
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
	.ar-card:focus-visible {
		outline: 2px solid var(--color-fg);
		outline-offset: 3px;
	}
	.ar-live {
		margin-top: 0.6rem;
		padding: 0.6rem 0.9rem;
		font: 500 0.78rem var(--app-font-mono);
		color: var(--color-fg-muted);
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 4%);
		border: 1px solid var(--color-border);
		border-radius: 10px;
	}
</style>
