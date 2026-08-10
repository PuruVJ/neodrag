<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable } from '@neodrag/svelte';
	import { Resizable } from '@neodrag/svelte/resize';
	import { Rotatable } from '@neodrag/svelte/rotate';

	const { world: _world }: { world: WorldMeta } = $props();

	// One element, every gesture. Priorities settle overlaps automatically: the rotate grip (110)
	// wins over a resize edge (100), which wins over the draggable body (0). Each writes a different
	// CSS channel — drag → `translate`, resize → width/height (+ left/top), rotate → `rotate` — so
	// they compose on the same node with no conflict.
	const drag = new Draggable({ bounds: 'parent' });
	const resize = new Resizable({ minWidth: 130, minHeight: 96, maxWidth: 320, maxHeight: 220 });
	const rotate = new Rotatable({ origin: 'center', step: 1 });

	const edges = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'] as const;

	const handleCls: Record<string, string> = {
		n: 'top-[-6px] right-3 left-3 w-auto cursor-ns-resize',
		s: 'bottom-[-6px] right-3 left-3 w-auto cursor-ns-resize',
		e: 'top-3 right-[-6px] bottom-3 h-auto cursor-ew-resize',
		w: 'top-3 bottom-3 left-[-6px] h-auto cursor-ew-resize',
		ne: 'top-[-6px] right-[-6px] cursor-nesw-resize',
		nw: 'top-[-6px] left-[-6px] cursor-nwse-resize',
		se: 'bottom-[-6px] right-[-6px] cursor-nwse-resize',
		sw: 'bottom-[-6px] left-[-6px] cursor-nesw-resize',
	};

	const verb = $derived(
		drag.isDragging ? 'moving' : resize.isResizing ? 'resizing' : rotate.isRotating ? 'rotating' : 'idle',
	);
</script>

<div class="pg-scene flex flex-col gap-1.5">
	<p class="pg-scene-kicker">Draggable · Resizable · Rotatable — one node</p>

	<div class="relative grid min-h-70 flex-1 place-items-center overflow-hidden rounded-2xl">
		<div
			class="absolute box-border grid cursor-grab touch-none place-items-center rounded-xl border-[1.5px] border-[#ff5d2e]/55 bg-[#ff5d2e]/15 p-4 shadow-xl transition-shadow duration-150 select-none {verb !==
			'idle'
				? 'shadow-2xl'
				: ''}"
			style="width: 200px; height: 140px;"
			{...drag.attach}
			{...resize.attach}
			{...rotate.attach}
		>
			<!-- rotate dial on a stick above the panel -->
			<span
				class="pointer-events-none absolute top-[-26px] left-1/2 h-[26px] w-[1.5px] -translate-x-1/2 bg-[#ff5d2e]/55"
				aria-hidden="true"
			></span>
			<span
				class="absolute top-[-34px] left-1/2 h-4 w-4 -translate-x-1/2 cursor-grab touch-none rounded-full border-2 border-white/70 bg-[#ff5d2e] shadow-md"
				{...rotate.handle('top')}
				aria-hidden="true"
			></span>

			<div class="pointer-events-none flex flex-col items-center gap-0.5 text-center">
				<span class="text-base font-semibold capitalize">{verb}</span>
				<span class="text-xs tabular-nums opacity-75">
					{Math.round(resize.size?.width ?? 200)} × {Math.round(resize.size?.height ?? 140)}
					· {Math.round(rotate.angle)}°
				</span>
			</div>

			{#each edges as dir (dir)}
				<span
					class="absolute h-3 w-3 touch-none {handleCls[dir]}"
					{...resize.handle(dir)}
					aria-hidden="true"
				></span>
			{/each}
		</div>
	</div>
</div>
