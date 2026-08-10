<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { SortableList } from '@neodrag/svelte/sortable';

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

	const btn = 'cursor-pointer px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider';
</script>

<div class="pg-scene indicator-scene">
	<p class="pg-scene-kicker">Sortable · indicator</p>
	<div
		class="inline-flex overflow-hidden rounded-full border-2 border-border-strong"
		role="group"
		aria-label="Drop indicator mode"
	>
		<button
			type="button"
			class="{btn} {mode === 'push' ? 'bg-brand text-shell' : 'text-fg-muted'}"
			onclick={() => (mode = 'push')}>push</button
		>
		<button
			type="button"
			class="{btn} {mode === 'line' ? 'bg-brand text-shell' : 'text-fg-muted'}"
			onclick={() => (mode = 'line')}>line</button
		>
	</div>
	<p class="indicator-sub">
		{mode === 'line'
			? 'Items hold still; a ghost stays put and a drop-line shows where it lands.'
			: 'Siblings slide to open a gap for the dragged item.'}
	</p>

	<ul class="m-0 flex w-[min(14rem,70%)] list-none flex-col gap-1.5 p-0" {...list.attach}>
		{#each tracks as track (track.id)}
			<li class="indicator-row" {...list.row(track.id)}>{track.label}</li>
		{/each}
	</ul>
</div>

<style>
	/* line mode: the lifted row reads as a carried preview — a library data-attr state, kept as CSS. */
	.indicator-row[data-neodrag-sortable-dragging] {
		border-color: var(--color-brand);
		box-shadow: 0 14px 30px -10px color-mix(in lch, var(--color-fg), transparent 55%);
		scale: 1.02;
	}
</style>
