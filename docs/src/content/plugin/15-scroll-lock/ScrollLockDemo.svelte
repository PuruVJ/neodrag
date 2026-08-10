<script lang="ts">
	import { Draggable, scrollLock } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `scrollLock` freezes scrolling, text selection and native panning on a container for the duration
	// of a drag, then restores the exact inline styles it touched. Drag the chip and try to scroll the
	// panel — it won't budge until you let go.
	let panel = $state<HTMLElement>();
	let dragging = $state(false);
	const drag = new Draggable({
		use: [scrollLock({ container: () => panel })],
		onDragStart: () => (dragging = true),
		onDragEnd: () => (dragging = false),
	});
	const rows = Array.from({ length: 14 }, (_, i) => i);
</script>

<DocDemo
	label="Drag the chip, then try to scroll the panel — it's frozen until you release"
	hint={dragging ? 'scroll locked' : 'scroll free'}
>
	{#snippet stage()}
		<div class="sl-panel" class:locked={dragging} bind:this={panel}>
			<button class="sl-chip" {...drag.attach}>drag me</button>
			{#each rows as r (r)}
				<div class="sl-row">scrollable row {r}</div>
			{/each}
		</div>
	{/snippet}
</DocDemo>

<style>
	.sl-panel {
		position: relative;
		width: 100%;
		height: 15rem;
		overflow: auto;
		border-radius: 10px;
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 3%);
		outline: 2px solid transparent;
		transition: outline-color 0.15s ease;
	}
	.sl-panel.locked {
		outline-color: var(--color-brand);
	}
	.sl-chip {
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
	.sl-chip:active {
		cursor: grabbing;
	}
	.sl-row {
		display: flex;
		align-items: center;
		height: 2.6rem;
		padding: 0 1rem;
		font: 500 0.78rem var(--app-font-mono);
		color: var(--color-fg-muted);
		border-top: 1px solid var(--color-border);
	}
</style>
