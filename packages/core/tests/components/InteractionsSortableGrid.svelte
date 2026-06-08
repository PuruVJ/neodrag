<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { Sortable } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	let items = $state(['a', 'b', 'c', 'd', 'e', 'f']);

	const engine = new Neodrag();

	const list = new Sortable({
		items: () => items.map((id) => ({ id })),
		keyBy: (item) => item.id,
		strategy: 'grid',
		onReorder: (next) => {
			items = next.map((row) => row.id);
		},
	});

	const bindList = stableDroppable(engine, () => list.container())();
	const bindItem = stableDraggable(engine, (id) => list.item(id));
</script>

<ul class="grid" data-testid="grid" {@attach bindList}>
	{#each items as id (id)}
		<li class="cell" {...list.rowAttrs()}>
			<button type="button" class="chip" data-testid="chip-{id}" {@attach bindItem(id)}>
				{id}
			</button>
		</li>
	{/each}
</ul>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 72px);
		gap: 8px;
		width: 240px;
		margin: 0;
		padding: 12px;
		list-style: none;
		border: 1px dashed #666;
	}
	.cell {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chip {
		width: 72px;
		padding: 10px 0;
		cursor: grab;
		background: #b8e0ff;
		border: 1px solid #6aa8d8;
		font: inherit;
	}
</style>
