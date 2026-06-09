<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList } from '@neodrag/svelte';

	const { world: _world }: { world: WorldMeta } = $props();

	type Track = { id: string; label: string };
	let tracks = $state<Track[]>([
		{ id: 'intro', label: 'Intro' },
		{ id: 'verse', label: 'Verse' },
		{ id: 'chorus', label: 'Chorus' },
		{ id: 'bridge', label: 'Bridge' },
		{ id: 'outro', label: 'Outro' },
	]);
	let mode = $state<'push' | 'line'>('line');

	const list = new SortableList<Track>({
		get items() {
			return tracks;
		},
		axis: 'y',
		animation: 200,
		get indicator() {
			return mode;
		},
		onReorder: (next) => (tracks = next),
	});
</script>

<div class="pg-scene indicator-scene">
	<p class="pg-scene-kicker">Sortable · indicator</p>
	<div class="indicator-toggle" role="group" aria-label="Drop indicator mode">
		<button type="button" class:is-active={mode === 'push'} onclick={() => (mode = 'push')}>push</button>
		<button type="button" class:is-active={mode === 'line'} onclick={() => (mode = 'line')}>line</button>
	</div>
	<p class="indicator-sub">
		{mode === 'line'
			? 'Items hold still; a ghost stays put and a drop-line shows where it lands.'
			: 'Siblings slide to open a gap for the dragged item.'}
	</p>

	<ul class="indicator-list" {...list.attach}>
		{#each tracks as track (track.id)}
			<li class="indicator-row" {...list.row(track)}>{track.label}</li>
		{/each}
	</ul>
</div>
