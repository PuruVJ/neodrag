<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `position` is two-way: drag writes it back, and setting it moves the box (controlled).
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

	const presets: Array<[string, { x: number; y: number }]> = [
		['0,0', { x: 0, y: 0 }],
		['120,0', { x: 120, y: 0 }],
		['120,80', { x: 120, y: 80 }],
		['0,80', { x: 0, y: 80 }],
	];
</script>

<DocDemo label="position — controlled + two-way" hint="{Math.round(pos.x)}, {Math.round(pos.y)}">
	{#snippet controls()}
		<span>set:</span>
		{#each presets as [lbl, p] (lbl)}
			<button type="button" aria-pressed={pos.x === p.x && pos.y === p.y} onclick={() => (pos = p)}>{lbl}</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<button class="db" {...drag.attach}>{Math.round(pos.x)}, {Math.round(pos.y)}</button>
	{/snippet}
</DocDemo>

<style>
	.db {
		display: grid;
		place-items: center;
		width: 5rem;
		height: 5rem;
		font: 700 0.78rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
	}
</style>
