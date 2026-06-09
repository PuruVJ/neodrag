<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList } from '@neodrag/svelte';

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

<div class="pg-scene fridge-paws">
	<div class="fridge-shell" aria-hidden="true">
		<span class="fridge-handle"></span>
		<span class="fridge-brand">NDR cold</span>
	</div>

	<p class="pg-scene-kicker">Sortable · swap</p>

	<ul class="fridge-magnet-list" {...list.attach}>
		{#each words as word, index (word)}
			<li
				class="fridge-magnet-row"
				style:--magnet-tilt="{index % 2 === 0 ? '-2deg' : '2deg'}"
				{...list.row(word)}
			>
				<button type="button" class="fridge-magnet" aria-label={word}>
					{word}
				</button>
			</li>
		{/each}
	</ul>

	<p class="fridge-hint">Drag a magnet onto another to swap places.</p>
</div>
