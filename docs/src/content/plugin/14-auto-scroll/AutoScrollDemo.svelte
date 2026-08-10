<script lang="ts">
	import { Draggable, autoScroll } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `autoScroll` scrolls the container when the dragged pointer drifts into its edge margin. The chip
	// lives inside a tall scrollable panel; drag it near the top or bottom edge to scroll the list.
	let panel = $state<HTMLElement>();
	const drag = new Draggable({
		use: [autoScroll({ container: () => panel, margin: 56, maxSpeed: 16 })],
	});
	const rows = Array.from({ length: 16 }, (_, i) => i);
</script>

<DocDemo label="Drag the chip toward the top or bottom edge — the list auto-scrolls" hint="autoScroll · margin 56px">
	{#snippet stage()}
		<div class="as-panel" bind:this={panel}>
			<button class="as-chip" {...drag.attach}>drag me</button>
			{#each rows as r (r)}
				<div class="as-row">row {r}</div>
			{/each}
		</div>
	{/snippet}
</DocDemo>

<style>
	.as-panel {
		position: relative;
		width: 100%;
		height: 15rem;
		overflow: auto;
		border-radius: 10px;
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 3%);
	}
	.as-chip {
		position: sticky;
		top: 0.6rem;
		left: 0.6rem;
		z-index: 2;
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		font: 700 0.78rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
		box-shadow: 0 4px 14px color-mix(in lch, var(--color-brand), transparent 65%);
	}
	.as-chip:active {
		cursor: grabbing;
	}
	.as-row {
		display: flex;
		align-items: center;
		height: 2.6rem;
		padding: 0 1rem;
		font: 500 0.78rem var(--app-font-mono);
		color: var(--color-fg-muted);
		border-top: 1px solid var(--color-border);
	}
</style>
