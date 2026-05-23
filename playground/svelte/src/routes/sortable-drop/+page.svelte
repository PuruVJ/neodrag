<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import { droppable, sortable, sortableItemBySelector } from '@neodrag/svelte/drop';

	let items = $state([
		{ id: '1', text: 'Item 1' },
		{ id: '2', text: 'Item 2' },
		{ id: '3', text: 'Item 3' },
		{ id: '4', text: 'Item 4' },
		{ id: '5', text: 'Item 5' }
	]);


	function handleSort(from: number, to: number) {
		console.log('SORT:', from, '->', to);
		// Move item in array using direct mutation
		const item = items.splice(from, 1)[0];
		items.splice(to, 0, item);
		console.log('UPDATED ITEMS:', items);
	}
</script>

<h1>Sortable Drop Demo</h1>

<div 
	class="sortable-container"
	style="border: 2px solid #333; padding: 20px; min-height: 400px; width: 300px;"
	{@attach droppable([
		sortable({
			onSort: handleSort
		})
	])}
>
	<h3>Sortable List</h3>
	{#each items as item (item.id)}
		<div 
			style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; background: white; cursor: move; transition: transform 0.2s ease;"
			{@attach draggable([])}
			{@attach sortableItemBySelector('.sortable-container')}
		>
			{item.text}
		</div>
	{/each}
</div>

<p>Items: {JSON.stringify(items.map(i => i.text))}</p>

<style>
	:global(.neodrag-sortable-dragging) {
		opacity: 0.8;
		transform: rotate(2deg) scale(1.02);
		z-index: 1000;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
</style>