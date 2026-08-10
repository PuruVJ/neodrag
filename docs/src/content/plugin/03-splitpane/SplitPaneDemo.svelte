<script lang="ts">
	import { SplitPane } from '@neodrag/svelte/splitpane';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Three panes sharing a conserved budget; each gutter resizes its own neighbour pair.
	const split = new SplitPane({ axis: 'x', sizes: [1, 1.4, 1], minSizes: 0.25 });
	const initial = [1, 1.4, 1];
</script>

<DocDemo
	label="Drag a gutter — the two neighbours trade space"
	hint="one grows by exactly what the other loses · min 0.25"
	reset={() => split.setSizes(initial)}
>
	{#snippet stage()}
		<div class="sp" {...split.container}>
			<div class="sp-pane" {...split.pane(0)}>A</div>
			<div class="sp-gutter" {...split.gutter(0)} aria-hidden="true"></div>
			<div class="sp-pane" {...split.pane(1)}>B</div>
			<div class="sp-gutter" {...split.gutter(1)} aria-hidden="true"></div>
			<div class="sp-pane" {...split.pane(2)}>C</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.sp {
		position: absolute;
		inset: 1.25rem;
	}
	.sp-pane {
		display: grid;
		place-items: center;
		font: 800 1rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 8%);
		border: 2px solid var(--color-border-strong);
		border-radius: 10px;
	}
	.sp-gutter {
		flex: 0 0 12px;
		align-self: stretch;
		margin: 0 2px;
		border-radius: 6px;
		background: var(--color-border-strong);
		cursor: col-resize;
		touch-action: none;
		transition: background 0.12s ease;
	}
	.sp-gutter:hover {
		background: var(--color-brand);
	}
</style>
