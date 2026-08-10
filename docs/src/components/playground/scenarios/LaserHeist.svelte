<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList, type TransferOp } from '@neodrag/svelte/sortable';

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
			id: column,
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

	const toneBorder: Record<string, string> = {
		plan: 'border-t-[#6b8cff]/80',
		sneak: 'border-t-[#f5a623]/80',
		escape: 'border-t-[#3ecf8e]/80',
	};
</script>

<div class="laser-heist pg-scene px-3 pt-10 pb-3">
	<p class="pg-scene-kicker">Sortable · kanban transfer</p>
	<p class="relative z-10 mt-0 mb-2.5 pl-0.5 text-sm font-semibold text-fg-muted">
		Drag cards between columns — grouped sortables with onTransfer.
	</p>

	<div
		class="relative z-10 grid h-[calc(100%-1.5rem)] min-h-0 grid-cols-3 gap-2 max-[720px]:h-auto max-[720px]:grid-cols-1"
	>
		{#each columns as column (column.id)}
			<section
				class="flex min-h-0 flex-col rounded-lg border-2 border-t-[3px] border-border bg-shell/75 {toneBorder[
					column.tone
				]}"
			>
				<header
					class="flex items-center justify-between border-b-2 border-border px-2.5 py-2 font-mono text-xs font-extrabold tracking-widest uppercase"
				>
					<span>{column.title}</span>
					<span class="rounded-full bg-brand/12 px-1.5 py-0.5">{in_column(column.id).length}</span>
				</header>
				<ul
					class="flex min-h-20 flex-1 list-none flex-col gap-1.5 overflow-visible p-1.5"
					{...lists[column.id].attach}
				>
					{#each in_column(column.id) as card (card.id)}
						<li {...lists[column.id].row(card.id)}>
							<button
								type="button"
								class="w-full cursor-grab touch-none rounded-md border-2 border-border-strong bg-shell px-2.5 py-2 text-left text-sm font-extrabold text-fg shadow-sm active:cursor-grabbing"
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

<style>
	/* Radial under-glow — a single tidy CSS rule beats a long arbitrary gradient value. */
	.laser-heist {
		background: radial-gradient(
			ellipse 90% 80% at 50% 100%,
			color-mix(in lch, var(--color-brand), transparent 90%) 0%,
			color-mix(in lch, var(--color-fg), transparent 4%) 100%
		);
	}

	.heist-board {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.55rem;
		height: calc(100% - 1.5rem);
		min-height: 0;
	}

	.heist-column {
		display: flex;
		flex-direction: column;
		min-height: 0;
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		background: color-mix(in lch, var(--app-color-shell), transparent 25%);
	}

	.heist-column--plan {
		border-top: 3px solid color-mix(in lch, #6b8cff, transparent 20%);
	}

	.heist-column--sneak {
		border-top: 3px solid color-mix(in lch, #f5a623, transparent 20%);
	}

	.heist-column--escape {
		border-top: 3px solid color-mix(in lch, #3ecf8e, transparent 20%);
	}

	.heist-column-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.6rem;
		font-family: var(--app-font-mono);
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		border-bottom: 2px solid var(--color-border);
	}

	.heist-count {
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		background: color-mix(in lch, var(--color-brand), transparent 88%);
	}

	.heist-cards {
		list-style: none;
		margin: 0;
		padding: 0.45rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		flex: 1;
		min-height: 5rem;
		overflow: visible;
	}

	.heist-cards li {
		margin: 0;
	}

	.heist-card {
		width: 100%;
		padding: 0.55rem 0.65rem;
		touch-action: none;
		cursor: grab;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 800;
		text-align: left;
		color: var(--color-fg);
		background: var(--app-color-shell);
		border: 2px solid var(--color-border-strong);
		border-radius: 0.35rem;
		box-shadow: 0 6px 16px -12px color-mix(in lch, var(--color-fg), transparent 78%);
	}

	.heist-card:active {
		cursor: grabbing;
	}

	@media (max-width: 720px) {
		.heist-board {
			grid-template-columns: 1fr;
			height: auto;
		}
	}
</style>
