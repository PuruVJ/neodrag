<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { keyboardDraggable } from '@neodrag/core/sensors';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	type KeyboardDragAxis = 'x' | 'y' | null;

	let node = $state<HTMLElement>();
	let axis = $state<KeyboardDragAxis>(null);
	let step = $state(4);
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

	$effect(() => {
		if (!node) return;
		const handle = keyboardDraggable(node, { grabKey: 'Space', step, axis });
		return () => handle.destroy();
	});
</script>

<DocDemo
	label="KeyboardMoveSensor — focus, then Space to grab and arrow keys to move"
	hint="Tab to the box, press Space, move with arrows, Space again to drop"
	reset={() => (pos = { x: 0, y: 0 })}
>
	{#snippet controls()}
		<span>axis:</span>
		{#each [{ l: 'x', v: 'x' }, { l: 'y', v: 'y' }, { l: 'free', v: null }] as const as a (a.l)}
			<button type="button" aria-pressed={axis === a.v} onclick={() => (axis = a.v as KeyboardDragAxis)}
				>{a.l}</button
			>
		{/each}
		<span>step:</span>
		{#each [1, 4, 12] as const as s (s)}
			<button type="button" aria-pressed={step === s} onclick={() => (step = s)}>{s}px</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<button bind:this={node} class="kbd-box" {...drag.attach}>Space</button>
	{/snippet}
</DocDemo>

<style>
	.kbd-box {
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
	.kbd-box:focus-visible {
		outline: 3px solid var(--color-fg);
		outline-offset: 3px;
	}
</style>
