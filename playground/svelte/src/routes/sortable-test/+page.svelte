<script lang="ts">
	import { Neodrag, transform } from '@neodrag/svelte';
	import { droppable, sortable } from '@neodrag/svelte/drop';

	let items = $state(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']);

	const list = sortable({
		items: () => items,
		keyBy: (item) => item,
		onReorder: (next) => {
			items = next;
		},
		strategy: 'vertical',
	});

	const bindDrop = (n: HTMLElement) => {
		const h = Neodrag.shared.droppable(n, list.container());
		return () => h.destroy();
	};

	const bindDrag = (n: HTMLElement, plugins: ReturnType<typeof list.item>) => {
		const h = Neodrag.shared.draggable(n, [transform, ...plugins]);
		return () => h.destroy();
	};
</script>

<h1>Sortable Test</h1>
<p>Drag items to reorder them.</p>

<div class="sortable-list" {@attach bindDrop}>
	{#each items as item (item)}
		<div class="sortable-item" {@attach (n) => bindDrag(n, list.item(item))}>
			<span class="index">{items.indexOf(item) + 1}</span>
			<span class="name">{item}</span>
		</div>
	{/each}
</div>

<div class="result">
	<h3>Current Order:</h3>
	<p>{items.join(' → ')}</p>
</div>

<style>
	.sortable-list {
		border: 2px solid #333;
		border-radius: 8px;
		padding: 20px;
		min-height: 300px;
		max-width: 400px;
		background: #f5f5f5;
	}

	.sortable-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		margin: 8px 0;
		background: white;
		border: 1px solid #ddd;
		border-radius: 6px;
		cursor: move;
		transition: all 0.2s ease;
		user-select: none;
	}

	.sortable-item:hover {
		border-color: #bbb;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.index {
		background: #333;
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: bold;
	}

	.name {
		font-weight: 500;
	}

	.result {
		margin-top: 20px;
		padding: 16px;
		background: #f0f9ff;
		border-radius: 6px;
		border: 1px solid #e0f2fe;
	}

	.result h3 {
		margin: 0 0 8px 0;
		color: #1e40af;
	}

	.result p {
		margin: 0;
		font-family: monospace;
		font-weight: 500;
	}
</style>
