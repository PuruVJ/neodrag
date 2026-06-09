<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable, magnetic } from '@neodrag/svelte';

	const { world: _world }: { world: WorldMeta } = $props();

	// Magnet points are offsets from the chip's start. use:[] extras are opt-in, tree-shakeable.
	const magnets = [
		{ x: 0, y: 0 },
		{ x: 150, y: 0 },
		{ x: 75, y: 70 },
		{ x: 0, y: 140 },
		{ x: 150, y: 140 },
	];
	// spring: flings onto the nearest magnet, overshoots, and settles — the engine pumps rAF frames
	// after the pointer stops, so it finishes the travel on its own.
	const drag = new Draggable({
		use: [magnetic(magnets, { radius: 90, spring: { stiffness: 0.22, damping: 0.74 } })],
	});
</script>

<div class="pg-scene extras-scene">
	<p class="pg-scene-kicker">Extras · use:[ ]</p>
	<p class="extras-sub">
		A draggable with the <code>magnetic</code> extra — it snaps to the nearest magnet point.
	</p>

	<div class="extras-grid">
		{#each magnets as m (`${m.x}-${m.y}`)}
			<span class="extras-magnet" style="left: {m.x + 18}px; top: {m.y + 18}px;" aria-hidden="true"></span>
		{/each}
		<button type="button" class="extras-chip" class:is-dragging={drag.isDragging} {...drag.attach}>
			snap me
		</button>
	</div>
</div>
