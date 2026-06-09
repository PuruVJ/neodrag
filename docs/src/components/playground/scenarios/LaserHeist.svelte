<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList, type TransferOp } from '@neodrag/svelte';

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

	function transfer_into(column: ColumnId, op: TransferOp<HeistCard>) {
		const moved: HeistCard = { ...op.item, column };
		const without = cards.filter((card) => card.id !== moved.id);
		const target = without.filter((card) => card.column === column);
		const rest = without.filter((card) => card.column !== column);
		target.splice(op.to, 0, moved);
		cards = [...rest, ...target];
	}

	function makeList(column: ColumnId) {
		return new SortableList<HeistCard>({
			get items() {
				return in_column(column);
			},
			group: 'heist-board',
			strategy: 'list',
			axis: 'y',
			animation: 200,
			onReorder: (next) => write_column(column, next),
			onTransfer: (op) => transfer_into(column, op),
		});
	}

	// One SortableList per column — a record of class instances just works in Svelte 5; each reads
	// its column's cards through a getter, so no manual update() is needed.
	const lists: Record<ColumnId, SortableList<HeistCard>> = {
		plan: makeList('plan'),
		sneak: makeList('sneak'),
		escape: makeList('escape'),
	};
</script>

<div class="pg-scene laser-heist">
	<p class="pg-scene-kicker">Sortable · kanban transfer</p>
	<p class="heist-sub">Drag cards between columns — grouped sortables with onTransfer.</p>

	<div class="heist-board">
		{#each columns as column (column.id)}
			<section class="heist-column heist-column--{column.tone}">
				<header class="heist-column-head">
					<span>{column.title}</span>
					<span class="heist-count">{in_column(column.id).length}</span>
				</header>
				<ul class="heist-cards" {...lists[column.id].attach}>
					{#each in_column(column.id) as card (card.id)}
						<li {...lists[column.id].row(card)}>
							<button type="button" class="heist-card">
								{card.label}
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>
