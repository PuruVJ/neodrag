<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { sortable } from '../../src/drop/index.ts';

	let { preview = false }: { preview?: boolean } = $props();

	let items = $state([
		{ id: '1', text: 'One' },
		{ id: '2', text: 'Two' },
		{ id: '3', text: 'Three' },
	]);

	const engine = new Neodrag();
	const list = sortable({
		items: () => items,
		keyBy: (i) => i.id,
		onReorder: (next) => {
			items = next;
		},
		onSortPreview: preview
			? (next) => {
					items = next as typeof items;
				}
			: undefined,
		strategy: 'vertical',
	});
	const bindDrop = (n: HTMLElement) => {
		const h = engine.droppable(n, list.container());
		return () => h.destroy();
	};
	const bindDrag = (n: HTMLElement, plugins: ReturnType<typeof list.item>) => {
		const h = engine.draggable(n, [...plugins]);
		return () => h.destroy();
	};
</script>

<ul class="list" data-testid="list" {@attach bindDrop}>
	{#each items as item (item.id)}
		<li
			data-testid="item-{item.id}"
			data-sortable-key={item.id}
			{@attach (n) => bindDrag(n, list.item(item.id))}
		>
			{item.text}
		</li>
	{/each}
</ul>

<style>
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		width: 200px;
	}
	li {
		padding: 12px;
		margin: 4px 0;
		background: #b8e0ff;
		cursor: grab;
	}
</style>
