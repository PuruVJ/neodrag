<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	let padding = $state(0);
	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		get bounds() {
			return { target: 'parent', padding };
		},
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
</script>

<DocDemo label="bounds — clamp inside the parent, with optional padding" reset={() => (pos = { x: 0, y: 0 })}>
	{#snippet controls()}
		<span>padding:</span>
		{#each [0, 16, 32] as p (p)}
			<button type="button" aria-pressed={padding === p} onclick={() => (padding = p)}>{p}px</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<div class="bd-inset" style="inset: {padding}px;" aria-hidden="true"></div>
		<button class="db" {...drag.attach}>drag</button>
	{/snippet}
</DocDemo>

<style>
	.bd-inset {
		position: absolute;
		border: 1px dashed color-mix(in lch, var(--color-brand), transparent 55%);
		border-radius: 8px;
		pointer-events: none;
		transition: inset 0.15s ease;
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
