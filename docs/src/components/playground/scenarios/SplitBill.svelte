<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList, type SortAxis, type TransferOp } from '@neodrag/svelte/sortable';

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
			id: owner,
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

<div
	class="split-bill pg-scene grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-3.5 px-3.5 pt-10 pb-3.5 max-[720px]:grid-cols-1"
>
	<p class="pg-scene-kicker">Sortable receipt & friend columns</p>

	<div class="flex min-h-0 flex-col rounded-lg border-2 border-border-strong bg-shell shadow-lg">
		<header
			class="flex items-baseline justify-between border-b-2 border-border bg-panel-strong px-3.5 py-2.5"
		>
			<span class="font-mono text-xs font-extrabold tracking-widest uppercase">Receipt</span>
			<span class="font-black text-brand">$25</span>
		</header>
		<ul
			class="split-bill-sortable-list flex min-h-18 list-none items-start gap-2 p-3.5"
			class:justify-center={tray_items.length === 0}
			class:content-center={tray_items.length === 0}
			{...lists.tray.attach}
			{@attach (n) => listLayout(n, 'tray')}
		>
			{#each tray_items as id (id)}
				<li class="m-0 list-none p-0" {...lists.tray.row(id)}>
					<button
						type="button"
						class="inline-flex cursor-grab touch-none items-center gap-2 rounded-full border-2 border-border-strong bg-panel-strong px-3 py-1.5 text-sm font-extrabold text-fg shadow-md active:cursor-grabbing"
					>
						<span>{META[id].label}</span>
						<em class="font-mono text-xs font-bold text-brand not-italic">{META[id].price}</em>
					</button>
				</li>
			{/each}
			{#if tray_items.length === 0}
				<li
					class="pointer-events-none m-0 p-2 text-center font-mono text-xs font-semibold tracking-wider uppercase text-fg-muted"
					aria-hidden="true"
				>
					Drop back to receipt
				</li>
			{/if}
		</ul>
	</div>

	<div class="grid min-h-0 grid-rows-2 gap-2.5">
		{#each ['alex', 'sam'] as friend (friend)}
			<div
				class="flex min-h-0 flex-col rounded-lg border-2 border-dashed border-border bg-shell/80 transition-all duration-150"
			>
				<div
					class="flex items-center gap-2 border-b-2 border-border px-3 py-2 font-mono text-xs font-extrabold tracking-wider uppercase"
				>
					<span aria-hidden="true">{friend === 'alex' ? '🦊' : '🐻'}</span>
					<span>{friend === 'alex' ? 'Alex' : 'Sam'}</span>
				</div>
				<ul
					class="split-bill-sortable-list flex min-h-14 flex-1 list-none items-start gap-2 p-2.5"
					class:justify-center={friend_order[friend as Friend].length === 0}
					class:content-center={friend_order[friend as Friend].length === 0}
					{...lists[friend as Friend].attach}
					{@attach (n) => listLayout(n, friend as Friend)}
				>
					{#each friend_order[friend as Friend] as id (id)}
						<li class="m-0 list-none p-0" {...lists[friend as Friend].row(id)}>
							<button
								type="button"
								class="inline-flex max-w-full cursor-grab touch-none items-center justify-between gap-2 self-start rounded-full border-2 border-border-strong bg-panel-strong px-3 py-1.5 text-sm font-extrabold text-fg shadow-md active:cursor-grabbing"
							>
								<span>{META[id].label}</span>
								<em class="font-mono text-xs font-bold text-brand not-italic">{META[id].price}</em>
							</button>
						</li>
					{/each}
					{#if friend_order[friend as Friend].length === 0}
						<li
							class="pointer-events-none m-0 p-2 text-center font-mono text-xs font-semibold tracking-wider uppercase text-fg-muted"
							aria-hidden="true"
						>
							Drop items here
						</li>
					{/if}
				</ul>
			</div>
		{/each}
	</div>

	{#if last_drop}
		<p
			class="pointer-events-none absolute bottom-2.5 left-1/2 z-20 m-0 -translate-x-1/2 rounded border border-border bg-shell px-2.5 py-1.5 font-mono text-xs font-extrabold tracking-widest uppercase text-brand"
			aria-live="polite"
		>
			{last_drop}
		</p>
	{/if}
</div>

<style>
	/* Receipt backdrop gradient + the self-sizing chip row (a self-referential container query) —
	   both are tidier as one CSS rule than a long arbitrary value. */
	.split-bill {
		background: linear-gradient(
			160deg,
			color-mix(in lch, var(--color-panel), transparent 5%) 0%,
			color-mix(in lch, var(--color-well), var(--color-brand) 4%) 100%
		);
	}

	.split-bill-sortable-list {
		container-type: inline-size;
	}

	@container (max-width: 10.5rem) {
		.split-bill-sortable-list {
			flex-direction: column;
			flex-wrap: nowrap;
		}
	}
</style>
