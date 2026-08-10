<script lang="ts">
	import { SortableList } from '@neodrag/svelte/sortable';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	type Tile = { id: string; label: string };
	const SEED: Tile[] = Array.from({ length: 9 }, (_, i) => ({
		id: String(i + 1),
		label: String(i + 1),
	}));

	let tiles = $state<Tile[]>(SEED.map((t) => ({ ...t })));
	const grid = new SortableList<Tile>({
		get items() {
			return tiles;
		},
		strategy: 'grid',
		onReorder: (next) => (tiles = next),
		animation: 200,
	});

	function reset() {
		tiles = SEED.map((t) => ({ ...t }));
	}
</script>

<DocDemo label="strategy: 'grid'" hint="2D closest-center targeting" {reset}>
	{#snippet stage()}
		<div class="gr" {...grid.attach}>
			{#each tiles as tile (tile.id)}
				<div class="gr-tile" {...grid.row(tile.id)}>{tile.label}</div>
			{/each}
		</div>
	{/snippet}
</DocDemo>

<style>
	.gr {
		display: grid;
		grid-template-columns: repeat(3, 3.4rem);
		gap: 0.4rem;
		margin: 0;
		padding: 0;
	}
	.gr-tile {
		box-sizing: border-box;
		display: grid;
		place-items: center;
		width: 3.4rem;
		height: 3.4rem;
		font: 700 0.9rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 10px;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
</style>
