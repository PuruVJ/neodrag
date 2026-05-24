<script lang="ts">
	import { Neodrag } from '@neodrag/svelte'
	import { transform } from '@neodrag/svelte/plugins';
	import { Droppable, sortable } from '@neodrag/svelte/drop';

	let items = $state([
		{ id: '1', text: 'Item 1' },
		{ id: '2', text: 'Item 2' },
		{ id: '3', text: 'Item 3' },
		{ id: '4', text: 'Item 4' },
		{ id: '5', text: 'Item 5' },
	]);

	const list = sortable({
		items: () => items,
		keyBy: (item) => item.id,
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

<h1>Sortable Drop Demo</h1>

<div
	class="sortable-container"
	style="border: 2px solid #333; padding: 20px; min-height: 400px; width: 300px;"
	{@attach bindDrop}
>
	<h3>Sortable List</h3>
	{#each items as item (item.id)}
		<div
			style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; background: white; cursor: move;"
			{@attach (n) => bindDrag(n, list.item(item.id))}
		>
			{item.text}
		</div>
	{/each}
</div>

<p>Items: {JSON.stringify(items.map((i) => i.text))}</p>
