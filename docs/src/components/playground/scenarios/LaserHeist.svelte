<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Droppable, applyGroupedSortableTransfer, highlight, Sortable } from '@neodrag/svelte/drop';
	import { ghost } from '@neodrag/svelte/plugins';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	type ColumnId = 'plan' | 'sneak' | 'escape';

	type HeistCard = {
		id: string;
		label: string;
		column: ColumnId;
	};

	const columns: { id: ColumnId; title: string; tone: string }[] = [
		{ id: 'plan', title: 'Plan', tone: 'plan' },
		{ id: 'sneak', title: 'Sneak', tone: 'sneak' },
		{ id: 'escape', title: 'Escape', tone: 'escape' },
	];

	let cards = $state<HeistCard[]>([
		{ id: 'case', label: 'Case the vault', column: 'plan' },
		{ id: 'lasers', label: 'Map lasers', column: 'plan' },
		{ id: 'duct', label: 'Crawl the duct', column: 'sneak' },
		{ id: 'guard', label: 'Dodge patrol', column: 'sneak' },
		{ id: 'gem', label: 'Grab the gem', column: 'escape' },
	]);

	function in_column(column: ColumnId) {
		return cards.filter((card) => card.column === column);
	}

	function write_column(column: ColumnId, next: HeistCard[]) {
		const tagged = next.map((card) => ({ ...card, column }));
		cards = [...cards.filter((card) => card.column !== column), ...tagged];
	}

	const column_highlight = highlight({ overClass: 'pg-drop-over' });

	function board_for(column: ColumnId) {
		return new Sortable({
			items: () => in_column(column),
			keyBy: (card) => card.id,
			group: 'heist-board',
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
			containerPlugins: () => [column_highlight],
			itemPlugins: () => [ghost({ opacity: 1 })],
		});
	}

	const boards = {
		plan: board_for('plan'),
		sneak: board_for('sneak'),
		escape: board_for('escape'),
	} as const;

	const columnDrops = {
		plan: new Droppable({ plugins: boards.plan.containerPlugins() }),
		sneak: new Droppable({ plugins: boards.sneak.containerPlugins() }),
		escape: new Droppable({ plugins: boards.escape.containerPlugins() }),
	} as const;

	function cardAttach(column: ColumnId, id: string) {
		return boards[column].item(id).attachment;
	}
</script>

<div class="pg-scene laser-heist">
	<p class="pg-scene-kicker">Sortable · kanban transfer</p>
	<p class="heist-sub">Drag cards between columns — grouped sortables with onTransfer.</p>

	<div class="heist-board">
		{#each columns as column (column.id)}
			<section class="heist-column heist-column--{column.tone}" {@attach columnDrops[column.id].attachment}>
				<header class="heist-column-head">
					<span>{column.title}</span>
					<span class="heist-count">{in_column(column.id).length}</span>
				</header>
				<ul class="heist-cards">
					{#each in_column(column.id) as card (card.id)}
						<li>
							<button
								type="button"
								class="heist-card"
								{@attach cardAttach(column.id, card.id)}
							>
								{card.label}
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>
