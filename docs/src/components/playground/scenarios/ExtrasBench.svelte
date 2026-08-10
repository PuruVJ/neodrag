<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable, magnetic } from '@neodrag/svelte';

	const { world: _world }: { world: WorldMeta } = $props();

	// Chip is absolutely placed at START with a fixed size, so we know its half-extent.
	const START = { x: 24, y: 24 };
	const SIZE = { w: 84, h: 40 };
	const HALF = { x: SIZE.w / 2, y: SIZE.h / 2 };

	// Magnets in offset space (deltas from the chip's top-left), pre-offset by `HALF` so each lands
	// under the chip's center — the home magnet is `HALF` (rests there, no jump on grab).
	const magnets = [
		{ x: HALF.x, y: HALF.y },
		{ x: HALF.x + 120, y: HALF.y },
		{ x: HALF.x + 60, y: HALF.y + 70 },
		{ x: HALF.x, y: HALF.y + 130 },
		{ x: HALF.x + 120, y: HALF.y + 130 },
	];

	// spring: eases the chip's center onto the nearest magnet and settles — the engine pumps rAF
	// frames after the pointer stops, so it finishes the travel on its own. Soft + gentle.
	const drag = new Draggable({
		use: [magnetic(magnets, { radius: 60, spring: { stiffness: 0.08, damping: 0.82 } })],
	});
</script>

<div class="pg-scene extras-scene">
	<p class="pg-scene-kicker">Extras · use:[ ]</p>
	<p class="extras-sub">
		A draggable with the <code>magnetic</code> extra — its center snaps to the nearest magnet point.
	</p>

	<div class="relative h-50 w-62 rounded-2xl border-2 border-dashed border-border-strong/70">
		{#each magnets as m (`${m.x}-${m.y}`)}
			<span
				class="absolute -mt-1.5 -ml-1.5 h-3 w-3 rounded-full border-2 border-brand/65 bg-brand/20"
				style="left: {START.x + m.x}px; top: {START.y + m.y}px;"
				aria-hidden="true"
			></span>
		{/each}
		<button
			type="button"
			class="z-10 cursor-grab touch-none rounded-lg border-0 bg-brand px-3 py-2 font-mono text-sm font-extrabold text-shell active:cursor-grabbing"
			style="position: absolute; box-sizing: border-box; display: grid; place-items: center; left: {START.x}px; top: {START.y}px; width: {SIZE.w}px; height: {SIZE.h}px;"
			{...drag.attach}
		>
			snap me
		</button>
	</div>
</div>
