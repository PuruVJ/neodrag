<script lang="ts">
	import { Draggable, magnetic } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `magnetic` is a use:[] extra. Targets are points in offset space; the soft spring eases the
	// chip onto the nearest one and settles after the pointer stops.
	const START = { x: 18, y: 18 };
	const HALF = { x: 28, y: 28 };
	const magnets = [
		{ x: HALF.x, y: HALF.y },
		{ x: HALF.x + 130, y: HALF.y },
		{ x: HALF.x + 65, y: HALF.y + 70 },
		{ x: HALF.x, y: HALF.y + 140 },
		{ x: HALF.x + 130, y: HALF.y + 140 },
	];

	let pos = $state({ x: 0, y: 0 });
	const drag = new Draggable({
		use: [magnetic(magnets, { radius: 70, spring: { stiffness: 0.1, damping: 0.82 } })],
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});

	function reset() {
		pos = { x: 0, y: 0 };
	}
</script>

<DocDemo label="Snap to the nearest magnet" hint="magnetic — soft spring" {reset}>
	{#snippet stage()}
		<div class="mg-grid">
			{#each magnets as m (m)}
				<span class="mg-dot" style="left: {START.x + m.x}px; top: {START.y + m.y}px;" aria-hidden="true"></span>
			{/each}
			<button
				class="mg-chip"
				style="position: absolute; left: {START.x}px; top: {START.y}px;"
				{...drag.attach}
				aria-label="Magnetic chip"
			>
				snap
			</button>
		</div>
	{/snippet}
</DocDemo>

<style>
	.mg-grid {
		position: relative;
		width: 226px;
		height: 196px;
		border: 2px dashed color-mix(in lch, var(--color-border-strong), transparent 30%);
		border-radius: 14px;
	}
	.mg-dot {
		position: absolute;
		width: 12px;
		height: 12px;
		margin: -6px 0 0 -6px;
		border-radius: 999px;
		border: 2px solid color-mix(in lch, var(--color-brand), transparent 35%);
		background: color-mix(in lch, var(--color-brand), transparent 80%);
	}
	.mg-chip {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		box-sizing: border-box;
		font: 800 0.78rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
		z-index: 1;
	}
</style>
