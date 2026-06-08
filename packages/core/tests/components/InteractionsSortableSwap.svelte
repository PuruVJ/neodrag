<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { Sortable } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	let items = $state([
		{ id: '1', text: 'One' },
		{ id: '2', text: 'Two' },
		{ id: '3', text: 'Three' },
	]);

	const engine = new Neodrag();
	const list = new Sortable({
		items: () => items,
		keyBy: (i) => i.id,
		mode: 'swap',
		onReorder: (next) => {
			items = next;
		},
		strategy: 'vertical',
	});

	const bindDrop = stableDroppable(engine, () => list.container())();
	const bindItem = stableDraggable(engine, (id) => list.item(id));
</script>

<ul class="list" data-testid="list" {@attach bindDrop}>
	{#each items as item (item.id)}
		<li data-testid="item-{item.id}" data-sortable-key={item.id} {@attach bindItem(item.id)}>
			{item.text}
		</li>
	{/each}
</ul>

<style>
	.list {
		position: relative;
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
