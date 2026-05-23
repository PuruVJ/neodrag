<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import { droppable, sortable, sortableItemBySelector } from '@neodrag/svelte/drop';

	let items = $state([
		'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'
	]);

	function handleSort(from: number, to: number) {
		console.log(`Moving item from ${from} to ${to}`);
		const item = items.splice(from, 1)[0];
		items.splice(to, 0, item);
	}
</script>

<h1>Sortable Test</h1>
<p>Drag items to reorder them. Z-index stacking is fixed!</p>

<div 
	class="sortable-list"
	{@attach droppable([
		sortable({
			onSort: handleSort
		})
	])}
>
	{#each items as item, index (item)}
		<div 
			class="sortable-item"
			{@attach draggable([])}
			{@attach sortableItemBySelector('.sortable-list')}
		>
			<span class="index">{index + 1}</span>
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

	:global(.neodrag-sortable-dragging) {
		opacity: 0.8 !important;
		transform: rotate(2deg) scale(1.02) !important;
		z-index: 9999 !important;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
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