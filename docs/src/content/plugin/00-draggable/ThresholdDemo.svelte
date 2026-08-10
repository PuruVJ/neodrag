<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	let threshold = $state(0);
	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		bounds: 'parent',
		get threshold() {
			return threshold;
		},
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
</script>

<DocDemo
	label="threshold — px the pointer must travel before a drag starts"
	hint={threshold === 0 ? 'starts immediately' : `move ${threshold}px first`}
	reset={() => (pos = { x: 0, y: 0 })}
>
	{#snippet controls()}
		<span>threshold:</span>
		{#each [0, 12, 36] as t (t)}
			<button type="button" aria-pressed={threshold === t} onclick={() => (threshold = t)}>{t}px</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<button class="db" {...drag.attach}>{threshold}px</button>
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
