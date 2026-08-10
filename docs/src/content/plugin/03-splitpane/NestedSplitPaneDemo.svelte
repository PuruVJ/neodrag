<script lang="ts">
	import { SplitPane } from '@neodrag/svelte/splitpane';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Two fully independent instances. The right pane of the outer (horizontal) split *contains* an
	// inner (vertical) split — an IDE-style layout. Dragging one gutter never touches the other.
	const outer = new SplitPane({ axis: 'x', sizes: [1, 2.2], minSizes: 0.2 });
	const inner = new SplitPane({ axis: 'y', sizes: [2, 1], minSizes: 0.2 });
	const reset = () => {
		outer.setSizes([1, 2.2]);
		inner.setSizes([2, 1]);
	};
</script>

<DocDemo
	label="Nested — the right pane is its own vertical split"
	hint="independent instances · innermost gutter wins"
	{reset}
>
	{#snippet stage()}
		<div class="sp" {...outer.container}>
			<div class="sp-pane sp-side" {...outer.pane(0)}>sidebar</div>
			<div class="sp-gutter sp-v" {...outer.gutter(0)} aria-hidden="true"></div>
			<div class="sp-pane sp-host" {...outer.pane(1)}>
				<div class="sp-fill" {...inner.container}>
					<div class="sp-pane" {...inner.pane(0)}>editor</div>
					<div class="sp-gutter sp-h" {...inner.gutter(0)} aria-hidden="true"></div>
					<div class="sp-pane sp-term" {...inner.pane(1)}>terminal</div>
				</div>
			</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.sp {
		position: absolute;
		inset: 1.25rem;
	}
	.sp-fill {
		width: 100%;
		height: 100%;
	}
	.sp-host {
		/* a pane that hosts a nested split — let the inner fill it */
		padding: 0;
		background: transparent;
		border: 0;
	}
	.sp-pane {
		display: grid;
		place-items: center;
		font: 700 0.85rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 8%);
		border: 2px solid var(--color-border-strong);
		border-radius: 10px;
	}
	.sp-side {
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 16%);
	}
	.sp-term {
		background: color-mix(in lch, var(--app-color-dark), transparent 90%);
		color: var(--color-fg-muted);
	}
	.sp-gutter {
		border-radius: 6px;
		background: var(--color-border-strong);
		transition: background 0.12s ease;
		touch-action: none;
	}
	.sp-gutter:hover {
		background: var(--color-brand);
	}
	.sp-v {
		flex: 0 0 12px;
		align-self: stretch;
		margin: 0 2px;
		cursor: col-resize;
	}
	.sp-h {
		flex: 0 0 12px;
		align-self: stretch;
		margin: 2px 0;
		cursor: row-resize;
	}
</style>
