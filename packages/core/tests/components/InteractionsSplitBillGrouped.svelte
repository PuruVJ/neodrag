<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import {
		applyGroupedSortableTransfer,
		collisionPriority,
		collisionStrategy,
		Sortable,
		type SortableStrategy,
	} from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	type ItemId = 'latte' | 'salad' | 'cake';
	type Friend = 'alex' | 'sam';
	type Owner = 'tray' | Friend;

	type BillItem = { id: ItemId; owner: Owner };

	type TransferCapture = { phase: 'preview' | 'commit'; toIndex: number };

	type Props = {
		initialAlex?: ItemId[];
		initialSam?: ItemId[];
		groupSourcePreview?: 'freeze' | 'reflow';
		fastTransition?: boolean;
		onTransfer?: (meta: TransferCapture) => void;
	};

	const {
		initialAlex = [],
		initialSam = [],
		groupSourcePreview,
		fastTransition = false,
		onTransfer,
	}: Props = $props();

	const GROUP = 'split-bill-test';

	const initial_friend_ids = new Set<ItemId>([...initialAlex, ...initialSam]);
	let tray_items = $state<ItemId[]>(
		(['latte', 'salad', 'cake'] as ItemId[]).filter((id) => !initial_friend_ids.has(id)),
	);
	let friend_order = $state<Record<Friend, ItemId[]>>({
		alex: [...initialAlex],
		sam: [...initialSam],
	});

	let zone_strategy = $state<Record<Owner, SortableStrategy>>({
		tray: 'horizontal',
		alex: 'horizontal',
		sam: 'horizontal',
	});

	const engine = new Neodrag();

	function all_items(): BillItem[] {
		const rows: BillItem[] = tray_items.map((id) => ({ id, owner: 'tray' as const }));
		for (const friend of ['alex', 'sam'] as const) {
			for (const id of friend_order[friend]) {
				rows.push({ id, owner: friend });
			}
		}
		return rows;
	}

	function items_for(owner: Owner) {
		const ids = owner === 'tray' ? tray_items : friend_order[owner];
		return ids.map((id) => ({ id, owner }));
	}

	function write_owner(owner: Owner, next: BillItem[]) {
		const ids = next.map((row) => row.id);
		if (owner === 'tray') {
			tray_items = ids;
			return;
		}
		friend_order = { ...friend_order, [owner]: ids };
	}

	function transfer_to(owner: Owner, item: BillItem, toIndex: number) {
		const rows = applyGroupedSortableTransfer(all_items(), item, {
			toIndex,
			column: owner,
			columnOf: (row) => row.owner,
			withColumn: (row, column) => ({ ...row, owner: column }),
		});
		tray_items = rows.filter((row) => row.owner === 'tray').map((row) => row.id);
		friend_order = {
			alex: rows.filter((row) => row.owner === 'alex').map((row) => row.id),
			sam: rows.filter((row) => row.owner === 'sam').map((row) => row.id),
		};
	}

	function board_for(owner: Owner) {
		return new Sortable({
			items: () => items_for(owner),
			keyBy: (item) => item.id,
			group: GROUP,
			groupSourcePreview,
			preview: 'visual',
			strategy: () => zone_strategy[owner],
			transition: fastTransition ? null : { duration: 220, easing: 'ease' },
			onReorder: (next) => write_owner(owner, next),
			onTransfer: (item, meta) => {
				onTransfer?.({ phase: meta.phase, toIndex: meta.toIndex });
				if (meta.phase !== 'commit' || meta.toIndex < 0) return;
				transfer_to(owner, item, meta.toIndex);
			},
			containerPlugins: () => [
				collisionPriority(owner === 'tray' ? 10 : 5),
				collisionStrategy('closestCenter'),
			],
		});
	}

	const boards = {
		tray: board_for('tray'),
		alex: board_for('alex'),
		sam: board_for('sam'),
	} as const;

	const bindTray = stableDroppable(engine, () => boards.tray.container());
	const bindAlex = stableDroppable(engine, () => boards.alex.container());
	const bindSam = stableDroppable(engine, () => boards.sam.container());

	const bindTrayItem = stableDraggable(engine, (id) => boards.tray.item(id));
	const bindAlexItem = stableDraggable(engine, (id) => boards.alex.item(id));
	const bindSamItem = stableDraggable(engine, (id) => boards.sam.item(id));

	function layoutZone(node: HTMLElement, zone: Owner) {
		const update = () => {
			if (node.closest('[data-sortable-dragging]')) return;
			const width = node.clientWidth;
			if (width < 48) return;
			const next: SortableStrategy = width < 168 ? 'vertical' : 'horizontal';
			if (zone_strategy[zone] === next) return;
			zone_strategy = { ...zone_strategy, [zone]: next };
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	}
</script>

<div class="harness" data-testid="harness">
	<section class="zone-host zone-host--tray" data-testid="tray-zone" {@attach bindTray}>
	<ul class="zone zone--tray" data-testid="tray-list" {@attach (n) => layoutZone(n, 'tray')}>
		{#each tray_items as id (id)}
			<li class="zone-row" data-sortable-key={id} {...boards.tray.rowAttrs()}>
				<button type="button" class="chip" data-testid="tray-chip-{id}" {@attach bindTrayItem(id)}>
					{id}
				</button>
			</li>
		{/each}
	</ul>
	</section>

	<section class="zone-host zone-host--friend" data-testid="alex-zone" {@attach bindAlex}>
	<ul class="zone zone--friend" data-testid="alex-list" {@attach (n) => layoutZone(n, 'alex')}>
		{#each friend_order.alex as id (id)}
			<li class="zone-row" data-sortable-key={id} {...boards.alex.rowAttrs()}>
				<button type="button" class="chip" data-testid="alex-chip-{id}" {@attach bindAlexItem(id)}>
					{id}
				</button>
			</li>
		{/each}
	</ul>
	</section>

	<section class="zone-host zone-host--friend" data-testid="sam-zone" {@attach bindSam}>
	<ul class="zone zone--friend" data-testid="sam-list" {@attach (n) => layoutZone(n, 'sam')}>
		{#each friend_order.sam as id (id)}
			<li class="zone-row" data-sortable-key={id} {...boards.sam.rowAttrs()}>
				<button type="button" class="chip" data-testid="sam-chip-{id}" {@attach bindSamItem(id)}>
					{id}
				</button>
			</li>
		{/each}
	</ul>
	</section>
</div>

<style>
	.harness {
		display: grid;
		grid-template-columns: 360px 120px 120px;
		gap: 16px;
		width: max-content;
		padding: 8px;
	}
	.zone {
		position: relative;
		display: flex;
		flex-flow: row wrap;
		align-items: flex-start;
		gap: 8px;
		margin: 0;
		padding: 12px;
		list-style: none;
		border: 1px dashed #666;
	}
	.zone-host--tray {
		width: 360px;
		flex: none;
	}
	.zone-host--friend {
		width: 120px;
		flex: none;
	}
	.zone--tray,
	.zone--friend {
		width: 100%;
		min-height: 72px;
	}
	.zone-row {
		margin: 0;
		padding: 0;
		list-style: none;
		will-change: transform;
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
