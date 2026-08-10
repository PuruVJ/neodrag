<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Resizable } from '@neodrag/svelte/resize';

	const { world: _world }: { world: WorldMeta } = $props();

	const resize = new Resizable({
		minWidth: 120,
		minHeight: 96,
		maxWidth: 360,
		maxHeight: 240,
	});

	const handles = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'] as const;

	const handleClass: Record<string, string> = {
		n: 'top-[-3px] right-[18px] left-[18px] h-[5px] cursor-ns-resize rounded-[2px]',
		s: 'bottom-[-3px] right-[18px] left-[18px] h-[5px] cursor-ns-resize rounded-[2px]',
		e: 'top-[18px] right-[-3px] bottom-[18px] w-[5px] cursor-ew-resize rounded-[2px]',
		w: 'top-[18px] bottom-[18px] left-[-3px] w-[5px] cursor-ew-resize rounded-[2px]',
		ne: 'top-[-5px] right-[-5px] h-[11px] w-[11px] cursor-nesw-resize rounded-[3px]',
		nw: 'top-[-5px] left-[-5px] h-[11px] w-[11px] cursor-nwse-resize rounded-[3px]',
		se: 'right-[-5px] bottom-[-5px] h-[11px] w-[11px] cursor-nwse-resize rounded-[3px]',
		sw: 'bottom-[-5px] left-[-5px] h-[11px] w-[11px] cursor-nesw-resize rounded-[3px]',
	};
</script>

<div class="pg-scene resize-scene">
	<p class="pg-scene-kicker">Resizable · edges + corners</p>
	<p class="resize-sub">Drag any edge or corner. Min/max bounded, eight handles.</p>

	<div class="relative min-h-64 w-full">
		<div
			class="absolute top-9 left-18 grid place-items-center rounded-2xl border-2 bg-panel-strong font-mono text-sm font-bold text-fg/80 shadow-lg"
			class:border-brand={resize.isResizing}
			class:border-border-strong={!resize.isResizing}
			style="width: 240px; height: 150px;"
			{...resize.attach}
		>
			<span>
				{Math.round(resize.size?.width ?? 240)} × {Math.round(resize.size?.height ?? 150)}
			</span>
			{#each handles as dir (dir)}
				<span
					class="absolute bg-brand {handleClass[dir]}"
					data-neodrag-resize-handle={dir}
					aria-hidden="true"
				></span>
			{/each}
		</div>
	</div>
</div>
