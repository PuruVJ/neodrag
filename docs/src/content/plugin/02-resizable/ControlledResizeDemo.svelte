<script lang="ts">
	import { Resizable, RESIZE_EDGES } from '@neodrag/svelte/resize';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Two-way `size` + `position`. Resizing writes both back live; a `w`/`n` edge moves `position`
	// to pin the far edge (it's the same offset space as a draggable's position). The buttons set
	// `size` programmatically — the box follows because the input is controlled.
	let size = $state({ width: 150, height: 110 });
	let position = $state({ x: 0, y: 0 });
	const resize = new Resizable({
		minWidth: 90,
		minHeight: 70,
		bounds: 'parent',
		get size() {
			return size;
		},
		set size(v) {
			size = v;
		},
		get position() {
			return position;
		},
		set position(v) {
			position = v;
		},
	});

	function preset(width: number, height: number) {
		size = { width, height };
	}
</script>

<DocDemo
	label="Controlled size + position — drag an edge, or set it"
	hint="get/set size + position · w/n edges shift position to pin the far edge"
	reset={() => ((size = { width: 150, height: 110 }), (position = { x: 0, y: 0 }))}
>
	{#snippet stage()}
		<div class="cz-box" class:is-resizing={resize.isResizing} {...resize.attach}>
			<span class="cz-read">
				{Math.round(size.width)} × {Math.round(size.height)}
				<small>@ {Math.round(position.x)}, {Math.round(position.y)}</small>
			</span>
			{#each RESIZE_EDGES as edge (edge)}
				<span class="cz-h cz-{edge}" {...resize.handle(edge)} aria-hidden="true"></span>
			{/each}
		</div>
		<div class="cz-buttons">
			<button type="button" onclick={() => preset(110, 80)}>small</button>
			<button type="button" onclick={() => preset(190, 140)}>large</button>
		</div>
	{/snippet}
</DocDemo>

<style>
	.cz-box {
		position: absolute;
		top: 2.25rem;
		left: 2.25rem;
		display: grid;
		place-items: center;
		text-align: center;
		font: 700 0.82rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 8%);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
		/* width/height/translate are written by the capability from the controlled size + position */
	}
	.cz-box.is-resizing {
		border-color: var(--color-brand);
	}
	.cz-read small {
		display: block;
		color: var(--color-fg-muted);
		font-size: 0.7rem;
	}
	.cz-buttons {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		display: flex;
		gap: 0.4rem;
	}
	.cz-buttons button {
		padding: 0.3rem 0.7rem;
		font: 600 0.74rem var(--app-font-mono);
		color: var(--color-fg);
		background: var(--app-color-shell);
		border: 1.5px solid var(--color-border-strong);
		border-radius: 7px;
		cursor: pointer;
	}
	.cz-buttons button:hover {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}
	.cz-h {
		position: absolute;
		background: transparent;
	}
	.cz-n { top: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
	.cz-s { bottom: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
	.cz-e { right: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
	.cz-w { left: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
	.cz-ne { top: -5px; right: -5px; width: 12px; height: 12px; cursor: nesw-resize; }
	.cz-nw { top: -5px; left: -5px; width: 12px; height: 12px; cursor: nwse-resize; }
	.cz-se { bottom: -5px; right: -5px; width: 12px; height: 12px; cursor: nwse-resize; }
	.cz-sw { bottom: -5px; left: -5px; width: 12px; height: 12px; cursor: nesw-resize; }
	.cz-ne, .cz-nw, .cz-se, .cz-sw {
		border-radius: 50%;
		background: var(--color-brand);
		opacity: 0;
		transition: opacity 0.15s ease;
	}
	.cz-box:hover .cz-ne,
	.cz-box:hover .cz-nw,
	.cz-box:hover .cz-se,
	.cz-box:hover .cz-sw,
	.cz-box.is-resizing .cz-ne,
	.cz-box.is-resizing .cz-nw,
	.cz-box.is-resizing .cz-se,
	.cz-box.is-resizing .cz-sw {
		opacity: 1;
	}
</style>
