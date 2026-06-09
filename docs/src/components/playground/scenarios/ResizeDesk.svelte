<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Resizable } from '@neodrag/svelte';

	const { world: _world }: { world: WorldMeta } = $props();

	const resize = new Resizable({
		minWidth: 120,
		minHeight: 96,
		maxWidth: 360,
		maxHeight: 240,
	});

	const handles = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'] as const;
</script>

<div class="pg-scene resize-scene">
	<p class="pg-scene-kicker">Resizable · edges + corners</p>
	<p class="resize-sub">Drag any edge or corner. Min/max bounded, eight handles.</p>

	<div class="resize-stage">
		<div
			class="resize-box"
			class:is-resizing={resize.isResizing}
			style="width: 240px; height: 150px;"
			{...resize.attach}
		>
			<span class="resize-dim">
				{Math.round(resize.size?.width ?? 240)} × {Math.round(resize.size?.height ?? 150)}
			</span>
			{#each handles as dir (dir)}
				<span
					class="resize-handle resize-handle--{dir}"
					data-neodrag-resize-handle={dir}
					aria-hidden="true"
				></span>
			{/each}
		</div>
	</div>
</div>
