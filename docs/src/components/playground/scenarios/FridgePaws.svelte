<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList } from '@neodrag/svelte/sortable';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	let words = $state(['purr', 'snack', 'meow', 'nap', 'zoomies']);

	const list = new SortableList({
		get items() {
			return words;
		},
		axis: 'y',
		onReorder: (next: string[]) => {
			words = next;
		},
	});
</script>

<div class="pg-scene bg-linear-to-b from-panel-strong to-well px-4 pt-10 pb-4">
	<div
		class="pointer-events-none absolute top-2.5 right-3 bottom-13 left-3 rounded-xl border-2 border-border-strong bg-panel"
		aria-hidden="true"
	>
		<span class="absolute top-[38%] right-2 h-[16%] w-2 rounded-full bg-border-strong"></span>
		<span
			class="absolute top-3.5 left-4 font-mono text-xs font-extrabold tracking-[0.2em] uppercase text-fg-muted"
			>NDR cold</span
		>
	</div>

	<p class="pg-scene-kicker">Sortable · swap</p>

	<ul class="relative z-10 m-0 flex list-none flex-col gap-2 px-5 pt-2 pb-0" {...list.attach}>
		{#each words as word, index (word)}
			<li class="m-0" style:--magnet-tilt={index % 2 === 0 ? '-2deg' : '2deg'} {...list.row(word)}>
				<button
					type="button"
					class="w-full cursor-grab touch-none rounded-md border-2 border-brand bg-brand/30 px-3.5 py-2.5 font-mono text-sm font-black lowercase text-fg shadow-md [transform:rotate(var(--magnet-tilt,0deg))] active:cursor-grabbing"
					aria-label={word}
				>
					{word}
				</button>
			</li>
		{/each}
	</ul>

	<p class="fridge-hint">Drag a magnet onto another to swap places.</p>
</div>
