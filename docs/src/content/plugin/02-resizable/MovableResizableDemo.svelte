<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { Resizable, RESIZE_EDGES } from '@neodrag/svelte/resize';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// One node, two capabilities. Resize claims its 8 handles at priority 100; Drag claims the body
	// at priority 0 — so a pointer-down on a handle resizes, anywhere else on the panel drags. Both
	// are bounded to the stage. The same node spreads BOTH attach objects.
	const drag = new Draggable({ bounds: 'parent' });
	const resize = new Resizable({ minWidth: 120, minHeight: 90, bounds: 'parent' });
</script>

<DocDemo
	label="Drag the body, resize from any edge"
	hint="one node · resize.attach + drag.attach, handles win at priority 100"
>
	{#snippet stage()}
		<div
			class="mr-panel"
			class:is-dragging={drag.isDragging}
			class:is-resizing={resize.isResizing}
			{...drag.attach}
			{...resize.attach}
		>
			<div class="mr-bar">
				<span class="mr-dots" aria-hidden="true">
					<i></i><i></i><i></i>
				</span>
				<span class="mr-title">
					{resize.size ? `${Math.round(resize.size.width)} × ${Math.round(resize.size.height)}` : 'panel'}
				</span>
			</div>
			<div class="mr-body">{drag.isDragging ? 'moving' : resize.isResizing ? 'resizing' : 'drag or resize me'}</div>

			{#each RESIZE_EDGES as edge (edge)}
				<span class="mr-h mr-{edge}" {...resize.handle(edge)} aria-hidden="true"></span>
			{/each}
		</div>
	{/snippet}
</DocDemo>

<style>
	.mr-panel {
		position: absolute;
		top: 2rem;
		left: 2rem;
		width: 13rem;
		height: 9rem;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 6%);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
		box-shadow: 0 10px 24px -16px color-mix(in lch, var(--color-fg), transparent 30%);
		cursor: grab;
		touch-action: none;
		user-select: none;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.mr-panel.is-dragging {
		cursor: grabbing;
		border-color: var(--color-brand);
		box-shadow: 0 18px 34px -16px color-mix(in lch, var(--color-fg), transparent 20%);
	}
	.mr-panel.is-resizing {
		border-color: var(--color-brand);
	}
	.mr-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		border-bottom: 1px solid var(--color-border);
		font: 700 0.72rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 12%);
	}
	.mr-dots {
		display: inline-flex;
		gap: 0.22rem;
	}
	.mr-dots i {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--color-border-strong);
	}
	.mr-body {
		flex: 1;
		display: grid;
		place-items: center;
		font: 600 0.78rem var(--app-font-mono);
		color: var(--color-fg-muted);
	}
	.mr-h {
		position: absolute;
		background: transparent;
	}
	/* edges */
	.mr-n { top: -4px; left: 10px; right: 10px; height: 8px; cursor: ns-resize; }
	.mr-s { bottom: -4px; left: 10px; right: 10px; height: 8px; cursor: ns-resize; }
	.mr-e { right: -4px; top: 10px; bottom: 10px; width: 8px; cursor: ew-resize; }
	.mr-w { left: -4px; top: 10px; bottom: 10px; width: 8px; cursor: ew-resize; }
	/* corners */
	.mr-ne { top: -5px; right: -5px; width: 12px; height: 12px; cursor: nesw-resize; }
	.mr-nw { top: -5px; left: -5px; width: 12px; height: 12px; cursor: nwse-resize; }
	.mr-se { bottom: -5px; right: -5px; width: 12px; height: 12px; cursor: nwse-resize; }
	.mr-sw { bottom: -5px; left: -5px; width: 12px; height: 12px; cursor: nesw-resize; }
	.mr-ne, .mr-nw, .mr-se, .mr-sw {
		border-radius: 50%;
		background: var(--color-brand);
		opacity: 0;
		transition: opacity 0.15s ease;
	}
	.mr-panel:hover .mr-ne,
	.mr-panel:hover .mr-nw,
	.mr-panel:hover .mr-se,
	.mr-panel:hover .mr-sw,
	.mr-panel.is-resizing .mr-ne,
	.mr-panel.is-resizing .mr-nw,
	.mr-panel.is-resizing .mr-se,
	.mr-panel.is-resizing .mr-sw {
		opacity: 1;
	}
</style>
