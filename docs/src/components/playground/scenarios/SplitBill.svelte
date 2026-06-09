<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList, type SortAxis, type TransferOp } from '@neodrag/svelte';

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

	let zone_axis = $state<Record<Owner, SortAxis>>({
		tray: 'x',
		alex: 'x',
		sam: 'x',
	});

	function items_for(owner: Owner): ItemId[] {
		return owner === 'tray' ? tray_items : friend_order[owner];
	}

	function write_owner(owner: Owner, next: ItemId[]) {
		if (owner === 'tray') {
			tray_items = next;
			return;
		}
		friend_order = { ...friend_order, [owner]: next };
	}

	function remove_everywhere(id: ItemId) {
		tray_items = tray_items.filter((row) => row !== id);
		friend_order = {
			alex: friend_order.alex.filter((row) => row !== id),
			sam: friend_order.sam.filter((row) => row !== id),
		};
	}

	function transfer_to(owner: Owner, op: TransferOp<ItemId>) {
		const id = op.item;
		const toIndex = op.to;
		remove_everywhere(id);
		const current = items_for(owner);
		const at = Math.max(0, Math.min(toIndex, current.length));
		const next = [...current.slice(0, at), id, ...current.slice(at)];
		write_owner(owner, next);
		const label = META[id].label;
		last_drop =
			owner === 'tray'
				? `${label} → Receipt`
				: owner === 'alex'
					? `${label} → Alex`
					: `${label} → Sam`;
	}

	function makeList(owner: Owner) {
		return new SortableList<ItemId>({
			get items() {
				return items_for(owner);
			},
			group: GROUP,
			strategy: 'list',
			get axis() {
				return zone_axis[owner];
			},
			animation: 220,
			onReorder: (next) => write_owner(owner, next),
			onTransfer: (op) => transfer_to(owner, op),
		});
	}

	// One SortableList per owner — a record of class instances just works in Svelte 5; each reads
	// its owner's items/axis through getters, so no manual update() effect is needed.
	const lists: Record<Owner, SortableList<ItemId>> = {
		tray: makeList('tray'),
		alex: makeList('alex'),
		sam: makeList('sam'),
	};

	function listLayout(node: HTMLElement, zone: Owner) {
		const update = () => {
			if (node.closest('[data-neodrag-sortable-dragging]')) return;
			const width = node.clientWidth;
			if (width < 48) return;
			const next: SortAxis = width < 168 ? 'y' : 'x';
			if (zone_axis[zone] === next) return;
			zone_axis = { ...zone_axis, [zone]: next };
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
			{...lists.tray.attach}
			{@attach (n) => listLayout(n, 'tray')}
		>
			{#each tray_items as id (id)}
				<li class="split-bill-tray-row" {...lists.tray.row(id)}>
					<button
						type="button"
						class="split-bill-chip"
						class:split-bill-chip--latte={id === 'latte'}
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
					{...lists[friend as Friend].attach}
					{@attach (n) => listLayout(n, friend as Friend)}
				>
					{#each friend_order[friend as Friend] as id (id)}
						<li class="split-bill-zone-row" {...lists[friend as Friend].row(id)}>
							<button
								type="button"
								class="split-bill-chip is-placed"
								class:split-bill-chip--latte={id === 'latte'}
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
