<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	let step = $state(24);
	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		bounds: 'parent',
		get grid() {
			return [step, step] as [number, number];
		},
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
</script>

<DocDemo label="grid — snap each move to a step" hint="{step}px grid" reset={() => (pos = { x: 0, y: 0 })}>
	{#snippet controls()}
		<span>step:</span>
		{#each [1, 24, 48] as s (s)}
			<button type="button" aria-pressed={step === s} onclick={() => (step = s)}>{s}px</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<div class="gd-grid" style="background-size: {step}px {step}px;" aria-hidden="true"></div>
		<button class="db" {...drag.attach}>snap</button>
	{/snippet}
</DocDemo>

<style>
	.gd-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(color-mix(in lch, var(--color-fg), transparent 90%) 1px, transparent 1px),
			linear-gradient(90deg, color-mix(in lch, var(--color-fg), transparent 90%) 1px, transparent 1px);
		pointer-events: none;
	}
	.db {
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		font: 700 0.8rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
	}
</style>
