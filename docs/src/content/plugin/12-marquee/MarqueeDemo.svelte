<script lang="ts">
	import { Selectable } from '@neodrag/svelte/select';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `Selectable` wraps the engine's `marqueeSelect` use:[] extra: the grid itself is a Draggable,
	// and dragging across it rubber-band selects every tile the box touches. Selected tiles get a
	// `data-neodrag-selected` attribute to style; `sel.selected` is the live set.
	const tiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
	const sel = new Selectable<string>();
	const count = $derived(sel.selected.size);
</script>

<DocDemo label="Drag across the tiles to rubber-band select them" hint={`${count} selected`} reset={() => sel.clear()}>
	{#snippet stage()}
		<div class="mq-grid" {...sel.container}>
			{#each tiles as id (id)}
				<div class="mq-tile" {...sel.item(id)}>{id}</div>
			{/each}
		</div>
	{/snippet}
</DocDemo>

<style>
	.mq-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.6rem;
		width: 100%;
		padding: 0.4rem;
	}
	.mq-tile {
		display: grid;
		place-items: center;
		height: 3.25rem;
		font: 600 0.78rem var(--app-font-mono);
		color: var(--color-fg-muted);
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 6%);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		user-select: none;
		transition:
			background 0.12s ease,
			color 0.12s ease,
			border-color 0.12s ease;
	}
	.mq-tile[data-neodrag-selected] {
		color: var(--app-color-shell);
		background: var(--color-brand);
		border-color: var(--color-brand);
	}
</style>
