<script lang="ts">
	import { SortableList } from '@neodrag/svelte/sortable';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	type Item = { id: string; label: string };
	const SEED: Item[] = [
		{ id: '1', label: 'Draft the spec' },
		{ id: '2', label: 'Build it' },
		{ id: '3', label: 'Review' },
		{ id: '4', label: 'Ship' },
	];

	let items = $state<Item[]>(SEED.map((i) => ({ ...i })));
	const list = new SortableList<Item>({
		get items() {
			return items;
		},
		onReorder: (next) => (items = next),
		animation: 200,
	});

	function reset() {
		items = SEED.map((i) => ({ ...i }));
	}
</script>

<DocDemo label="Drag to reorder" hint="FLIP-animated; row(item.id) binds each row" {reset}>
	{#snippet stage()}
		<ul class="sl" {...list.attach}>
			{#each items as item (item.id)}
				<li class="sl-row" {...list.row(item.id)}>{item.label}</li>
			{/each}
		</ul>
	{/snippet}
</DocDemo>

<style>
	.sl {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		width: min(16rem, 80%);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.sl-row {
		box-sizing: border-box;
		padding: 0.6rem 0.85rem;
		font: 600 0.82rem var(--app-font-mono);
		color: var(--color-fg);
		background: var(--app-color-shell);
		border: 2px solid var(--color-border-strong);
		border-radius: 10px;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
</style>
