<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { Sortable, type SortableStrategy } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	let items = $state(['latte', 'salad', 'cake']);

	let global_strategy = $state<SortableStrategy>('horizontal');
	let per_zone_strategy = $state<Record<string, SortableStrategy>>({ tray: 'horizontal' });

	const { usePerZone = false }: { usePerZone?: boolean } = $props();

	const engine = new Neodrag();

	const list = new Sortable({
		items: () => items.map((id) => ({ id })),
		keyBy: (row) => row.id,
		strategy: () => (usePerZone ? per_zone_strategy.tray : global_strategy),
		releaseDuration: 220,
		onReorder: (next) => {
			items = next.map((row) => row.id);
		},
	});

	const bindList = stableDroppable(engine, () => list.container())();
	const bindItem = stableDraggable(engine, (id) => list.item(id));

	function layoutTray(node: HTMLElement) {
		const update = () => {
			if (!usePerZone) return;
			const width = node.clientWidth;
			if (width < 48) return;
			const next: SortableStrategy = width < 168 ? 'vertical' : 'horizontal';
			if (per_zone_strategy.tray === next) return;
			per_zone_strategy = { ...per_zone_strategy, tray: next };
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(node);
		return () => ro.disconnect();
	}

	function layoutNarrowFriend(node: HTMLElement) {
		const update = () => {
			global_strategy = node.clientWidth < 168 ? 'vertical' : 'horizontal';
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(node);
		return () => ro.disconnect();
	}
</script>

<div class="harness" data-testid="harness">
	<ul class="tray" data-testid="tray-list" {@attach bindList} {@attach layoutTray}>
		{#each items as id (id)}
			<li class="tray-row" {...list.rowAttrs()}>
				<button type="button" class="chip" data-testid="chip-{id}" {@attach bindItem(id)}>{id}</button>
			</li>
		{/each}
	</ul>
	{#if !usePerZone}
		<div class="friend-narrow" data-testid="narrow-spy" {@attach layoutNarrowFriend}></div>
	{/if}
</div>

<style>
	.harness {
		position: relative;
		width: 420px;
		padding: 8px;
	}
	.tray {
		position: relative;
		display: flex;
		flex-flow: row wrap;
		align-items: flex-start;
		gap: 8px;
		width: 360px;
		margin: 0;
		padding: 12px;
		list-style: none;
		border: 1px dashed #666;
	}
	.tray-row {
		margin: 0;
		padding: 0;
		list-style: none;
		will-change: transform;
	}
	[data-neodrag-sortable-row]:has([data-neodrag-sortable-lifted]) {
		min-height: 2.5rem;
	}
	.chip {
		min-width: 72px;
		padding: 10px 12px;
		cursor: grab;
		background: #b8e0ff;
		border: 1px solid #6aa8d8;
		font: inherit;
	}
	.friend-narrow {
		width: 120px;
		height: 60px;
		margin-top: 8px;
		border: 1px dashed #999;
	}
</style>
