<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { Sortable } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	let items = $state(['alpha', 'bravo', 'charlie']);

	const engine = new Neodrag();

	const list = new Sortable({
		items: () => items.map((id) => ({ id })),
		keyBy: (item) => item.id,
		strategy: 'horizontal',
		releaseDuration: 0,
		preview: 'state',
		onReorder: (next) => {
			items = next.map((row) => row.id);
		},
		onSortPreview: (next) => {
			items = next.map((row) => row.id);
		},
	});

	const bindList = stableDroppable(engine, () => list.container())();

	const bindItem = stableDraggable(engine, (id) => list.item(id));
</script>

<ul class="list" data-testid="list" {@attach bindList}>
	{#each items as id (id)}
		<li class="row" {...list.rowAttrs()}>
			<button type="button" class="chip" data-testid="chip-{id}" {@attach bindItem(id)}>
				{id}
			</button>
		</li>
	{/each}
</ul>

<style>
	.list {
		position: relative;
		display: flex;
		flex-direction: row;
		gap: 8px;
		width: 360px;
		margin: 0;
		padding: 12px;
		list-style: none;
		border: 1px dashed #666;
	}
	.row {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chip {
		min-width: 72px;
		padding: 10px 12px;
		cursor: grab;
		background: #b8e0ff;
		border: 1px solid #6aa8d8;
		font: inherit;
	}
</style>
