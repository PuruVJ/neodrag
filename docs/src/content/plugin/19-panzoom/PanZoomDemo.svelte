<script lang="ts">
	import { PanZoom } from '@neodrag/svelte/panzoom';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// The viewport is a Draggable running the `pan` plugin (drag empty space to pan); wheel and pinch
	// zoom toward the cursor. The world layer is the only thing that transforms — the viewport clips.
	const canvas = new PanZoom({ minScale: 0.4, maxScale: 4 });
	const cards = [
		{ x: 60, y: 44, label: 'drag to pan' },
		{ x: 320, y: 120, label: 'scroll / pinch to zoom' },
		{ x: 150, y: 250, label: 'toward the cursor' },
		{ x: 440, y: 320, label: 'reset to recenter' },
	];
	const pct = $derived(Math.round(canvas.scale * 100));
</script>

<DocDemo label="Drag to pan · scroll or pinch to zoom" hint={`${pct}%`} reset={() => canvas.reset()}>
	{#snippet controls()}
		<button type="button" onclick={() => canvas.zoomBy(1.25)}>zoom in</button>
		<button type="button" onclick={() => canvas.zoomBy(0.8)}>zoom out</button>
	{/snippet}
	{#snippet stage()}
		<div class="pz-viewport" {...canvas.viewport}>
			<div class="pz-world" {...canvas.world}>
				<div class="pz-grid"></div>
				{#each cards as c (c.label)}
					<div class="pz-card" style="left: {c.x}px; top: {c.y}px;">{c.label}</div>
				{/each}
			</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.pz-viewport {
		position: relative;
		width: 100%;
		height: 18rem;
		cursor: grab;
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 3%);
	}
	.pz-viewport:active {
		cursor: grabbing;
	}
	.pz-world {
		position: absolute;
		inset: 0;
	}
	.pz-grid {
		position: absolute;
		left: -2000px;
		top: -2000px;
		width: 5000px;
		height: 5000px;
		background-image:
			linear-gradient(to right, var(--color-border) 1px, transparent 1px),
			linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.6;
	}
	.pz-card {
		position: absolute;
		display: grid;
		place-items: center;
		padding: 0.7rem 1rem;
		font: 600 0.76rem var(--app-font-mono);
		white-space: nowrap;
		color: var(--app-color-shell);
		background: var(--color-brand);
		border-radius: 10px;
		box-shadow: 0 4px 14px color-mix(in lch, var(--color-brand), transparent 70%);
		user-select: none;
	}
</style>
