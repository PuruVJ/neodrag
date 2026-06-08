<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { applyGroupedSortableTransfer, Sortable } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	type ColumnId = 'a' | 'b';

	type Card = {
		id: string;
		label: string;
		column: ColumnId;
	};

	let cards = $state<Card[]>([
		{ id: '1', label: 'Alpha', column: 'a' },
		{ id: '2', label: 'Beta', column: 'a' },
		{ id: '3', label: 'Gamma', column: 'b' },
	]);

	const engine = new Neodrag();

	function in_column(column: ColumnId) {
		return cards.filter((card) => card.column === column);
	}

	function write_column(column: ColumnId, next: Card[]) {
		const tagged = next.map((card) => ({ ...card, column }));
		cards = [...cards.filter((card) => card.column !== column), ...tagged];
	}

	function board_for(column: ColumnId) {
		return new Sortable({
			items: () => in_column(column),
			keyBy: (card) => card.id,
			group: 'kanban-test',
			strategy: 'vertical',
			onReorder: (next) => write_column(column, next),
			onTransfer: (card, meta) => {
				cards = applyGroupedSortableTransfer(cards, card, {
					toIndex: meta.toIndex,
					column,
					columnOf: (row) => row.column,
					withColumn: (row, col) => ({ ...row, column: col }),
				});
			},
		});
	}

	const boards = {
		a: board_for('a'),
		b: board_for('b'),
	} as const;

	const bind_column = (column: ColumnId) =>
		stableDroppable(engine, () => boards[column].container())();

	const bind_card = stableDraggable(engine, (id) => {
		const column = cards.find((card) => card.id === id)?.column ?? 'a';
		return boards[column].item(id);
	});
</script>

<div class="board" data-testid="board">
	{#each ['a', 'b'] as column (column)}
		<section class="column" data-testid="column-{column}" {@attach bind_column(column as ColumnId)}>
			<ul class="cards" data-testid="list-{column}">
				{#each in_column(column as ColumnId) as card (card.id)}
					<li {...boards[column].rowAttrs()}>
						<button
							type="button"
							class="card"
							data-testid="card-{card.id}"
							data-sortable-key={card.id}
							{@attach bind_card(card.id)}
						>
							{card.label}
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.board {
		display: flex;
		gap: 16px;
		padding: 8px;
	}
	.column {
		width: 140px;
		min-height: 180px;
		padding: 8px;
		border: 1px dashed #666;
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.card {
		width: 100%;
		padding: 10px;
		cursor: grab;
		background: #d4e8ff;
		border: 1px solid #8ab4e8;
	}
</style>
