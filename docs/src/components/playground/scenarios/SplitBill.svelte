<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import {
		applyGroupedSortableTransfer,
		collisionPriority,
		collisionStrategy,
		highlight,
		Sortable,
		type SortableStrategy,
	} from '@neodrag/svelte/drop';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	type ItemId = 'latte' | 'salad' | 'cake';
	type Friend = 'alex' | 'sam';
	type Owner = 'tray' | Friend;

	const META: Record<ItemId, { label: string; price: string }> = {
		latte: { label: 'Latte', price: '$5' },
		salad: { label: 'Salad', price: '$12' },
		cake: { label: 'Cake', price: '$8' },
	};

	const GROUP = 'split-bill';

	let tray_items = $state<ItemId[]>(['latte', 'salad', 'cake']);
	let friend_order = $state<Record<Friend, ItemId[]>>({
		alex: [],
		sam: [],
	});

	let last_drop = $state('');

	let zone_strategy = $state<Record<Owner, SortableStrategy>>({
		tray: 'horizontal',
		alex: 'horizontal',
		sam: 'horizontal',
	});

	const highlight_success = highlight({ overClass: 'pg-drop-over pg-drop-over--success' });

	type BillItem = { id: ItemId; owner: Owner };

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
		const label = META[item.id].label;
		last_drop =
			owner === 'tray'
				? `${label} → Receipt`
				: owner === 'alex'
					? `${label} → Alex`
					: `${label} → Sam`;
	}

	function board_for(owner: Owner) {
		return new Sortable({
			items: () => items_for(owner),
			keyBy: (item) => item.id,
			group: GROUP,
			preview: 'visual',
			strategy: () => zone_strategy[owner],
			transition: { duration: 220, easing: 'ease' },
			onReorder: (next) => write_owner(owner, next),
			onTransfer: (item, meta) => {
				if (meta.phase !== 'commit' || meta.toIndex < 0) return;
				transfer_to(owner, item, meta.toIndex);
			},
			containerPlugins: () => [
				collisionPriority(owner === 'tray' ? 10 : 5),
				collisionStrategy('closestCenter'),
				highlight_success,
			],
		});
	}

	const boards = {
		tray: board_for('tray'),
		alex: board_for('alex'),
		sam: board_for('sam'),
	} as const;

	function listLayout(node: HTMLElement, zone: Owner) {
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

<div class="pg-scene split-bill">
	<p class="pg-scene-kicker">Sortable receipt & friend columns</p>

	<div class="split-bill-tray">
		<header class="split-bill-tray-head">
			<span class="split-bill-tray-title">Receipt</span>
			<span class="split-bill-tray-total">$25</span>
		</header>
		<ul
			class="split-bill-sortable-list split-bill-tray-body"
			class:is-empty={tray_items.length === 0}
			{...boards.tray.container}
			{@attach (n) => listLayout(n, 'tray')}
		>
			{#each tray_items as id (id)}
				<li class="split-bill-tray-row" {...boards.tray.row()}>
					<button
						type="button"
						class="split-bill-chip"
						class:split-bill-chip--latte={id === 'latte'}
						{...boards.tray.item(id).target}
					>
						<span>{META[id].label}</span>
						<em>{META[id].price}</em>
					</button>
				</li>
			{/each}
			{#if tray_items.length === 0}
				<li class="split-bill-zone-placeholder" aria-hidden="true">Drop back to receipt</li>
			{/if}
		</ul>
	</div>

	<div class="split-bill-friends">
		{#each ['alex', 'sam'] as friend (friend)}
			<div class="split-bill-zone split-bill-zone--{friend}">
				<div class="split-bill-zone-head">
					<span aria-hidden="true">{friend === 'alex' ? '🦊' : '🐻'}</span>
					<span>{friend === 'alex' ? 'Alex' : 'Sam'}</span>
				</div>
				<ul
					class="split-bill-sortable-list split-bill-zone-body"
					class:is-empty={friend_order[friend as Friend].length === 0}
					{...boards[friend as Friend].container}
					{@attach (n) => listLayout(n, friend as Friend)}
				>
					{#each friend_order[friend as Friend] as id (id)}
						<li class="split-bill-zone-row" {...boards[friend as Friend].row()}>
							<button
								type="button"
								class="split-bill-chip is-placed"
								class:split-bill-chip--latte={id === 'latte'}
								{...boards[friend as Friend].item(id).target}
							>
								<span>{META[id].label}</span>
								<em>{META[id].price}</em>
							</button>
						</li>
					{/each}
					{#if friend_order[friend as Friend].length === 0}
						<li class="split-bill-zone-placeholder" aria-hidden="true">Drop items here</li>
					{/if}
				</ul>
			</div>
		{/each}
	</div>

	{#if last_drop}
		<p class="split-bill-toast" aria-live="polite">{last_drop}</p>
	{/if}
</div>
