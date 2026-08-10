<script lang="ts">
	import { Resizable, RESIZE_EDGES } from '@neodrag/svelte/resize';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Toggle aspectRatio between locked (true, keeps the starting ratio) and free. The option is read
	// through a getter so the toggle takes effect on the next gesture without rebuilding the instance.
	let locked = $state(true);
	const resize = new Resizable({
		minWidth: 90,
		minHeight: 70,
		bounds: 'parent',
		get aspectRatio() {
			return locked;
		},
	});
</script>

<DocDemo label="aspectRatio — lock the width/height ratio" hint="toggle, then drag a corner">
	{#snippet controls()}
		<span>aspectRatio:</span>
		<button type="button" aria-pressed={locked} onclick={() => (locked = true)}>locked</button>
		<button type="button" aria-pressed={!locked} onclick={() => (locked = false)}>free</button>
	{/snippet}
	{#snippet stage()}
		<div class="rz-box" class:is-resizing={resize.isResizing} {...resize.attach}>
			<span class="rz-size">
				{resize.size ? `${Math.round(resize.size.width)} × ${Math.round(resize.size.height)}` : 'resize me'}
			</span>
			{#each RESIZE_EDGES as edge (edge)}
				<span class="rz-h rz-{edge}" {...resize.handle(edge)} aria-hidden="true"></span>
			{/each}
		</div>
	{/snippet}
</DocDemo>

<style>
	.rz-box {
		position: absolute;
		top: 2.25rem;
		left: 2.25rem;
		width: 9rem;
		height: 6rem;
		display: grid;
		place-items: center;
		font: 700 0.8rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 8%);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
	}
	.rz-box.is-resizing {
		border-color: var(--color-brand);
	}
	.rz-h {
		position: absolute;
		background: transparent;
	}
	/* edges */
	.rz-n { top: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
	.rz-s { bottom: -4px; left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
	.rz-e { right: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
	.rz-w { left: -4px; top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
	/* corners */
	.rz-ne { top: -5px; right: -5px; width: 12px; height: 12px; cursor: nesw-resize; }
	.rz-nw { top: -5px; left: -5px; width: 12px; height: 12px; cursor: nwse-resize; }
	.rz-se { bottom: -5px; right: -5px; width: 12px; height: 12px; cursor: nwse-resize; }
	.rz-sw { bottom: -5px; left: -5px; width: 12px; height: 12px; cursor: nesw-resize; }
	.rz-ne, .rz-nw, .rz-se, .rz-sw {
		border-radius: 50%;
		background: var(--color-brand);
		opacity: 0;
		transition: opacity 0.15s ease;
	}
	.rz-box:hover .rz-ne,
	.rz-box:hover .rz-nw,
	.rz-box:hover .rz-se,
	.rz-box:hover .rz-sw,
	.rz-box.is-resizing .rz-ne,
	.rz-box.is-resizing .rz-nw,
	.rz-box.is-resizing .rz-se,
	.rz-box.is-resizing .rz-sw {
		opacity: 1;
	}
</style>
