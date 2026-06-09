<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList } from '@neodrag/svelte';

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

<div class="pg-scene sticker-grid">
	<p class="pg-scene-kicker">Sortable · 2D grid</p>
	<p class="sticker-grid-sub">Drag any sticker — it snaps to the nearest cell, the rest reflow.</p>

	<div class="sticker-grid-board" {...grid.attach}>
		{#each tiles as tile (tile.id)}
			<button type="button" class="sticker-grid-tile" {...grid.row(tile)}>
				<span aria-hidden="true">{tile.emoji}</span>
			</button>
		{/each}
	</div>
</div>
