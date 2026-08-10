<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList } from '@neodrag/svelte/sortable';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	type Tile = { id: string; emoji: string };

	let tiles = $state<Tile[]>([
		{ id: 'star', emoji: '⭐' },
		{ id: 'heart', emoji: '💖' },
		{ id: 'bolt', emoji: '⚡' },
		{ id: 'moon', emoji: '🌙' },
		{ id: 'flame', emoji: '🔥' },
		{ id: 'clover', emoji: '🍀' },
		{ id: 'gem', emoji: '💎' },
		{ id: 'wave', emoji: '🌊' },
		{ id: 'snow', emoji: '❄️' },
	]);

	// 2D grid sortable: `strategy: 'grid'` snaps the dragged tile to the closest cell center instead
	// of crossing midpoints along one axis. Same data flow as a list — items in, onReorder out.
	const grid = new SortableList<Tile>({
		get items() {
			return tiles;
		},
		strategy: 'grid',
		animation: 200,
		onReorder: (next) => (tiles = next),
	});
</script>

<div class="pg-scene flex h-full flex-col items-center justify-center gap-2">
	<p class="pg-scene-kicker">Sortable · 2D grid</p>
	<p class="m-0 max-w-72 text-center text-sm font-semibold text-fg-muted">
		Drag any sticker — it snaps to the nearest cell, the rest reflow.
	</p>

	<div class="grid w-[min(15rem,72%)] grid-cols-3 gap-2" {...grid.attach}>
		{#each tiles as tile (tile.id)}
			<button
				type="button"
				class="flex aspect-square cursor-grab touch-none items-center justify-center rounded-2xl border-2 border-border-strong bg-panel-strong text-2xl leading-none shadow-lg active:cursor-grabbing"
				{...grid.row(tile.id)}
			>
				<span aria-hidden="true">{tile.emoji}</span>
			</button>
		{/each}
	</div>
</div>
