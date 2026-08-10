<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable } from '@neodrag/svelte';
	import { Droppable } from '@neodrag/svelte/drop';

	const { world: _world }: { world: WorldMeta } = $props();

	const step = 24;

	const van = new Draggable({
		bounds: 'parent',
		grid: [step, step],
		dragData: { kind: 'van' },
		threshold: 0,
	});

	const LABELS: Record<string, string> = {
		north: 'North depot',
		east: 'East depot',
		south: 'South depot',
	};

	let delivered = $state('');

	// Each depot accepts the van and records the delivery on drop. `isOver` (driven by the engine's
	// real enter/leave hit-testing) lights it green — no mouse-hover guesswork, which never fires
	// once the pointer is captured by the drag.
	const drop_for = (id: string) =>
		new Droppable({
			accepts: ({ data }) => (data as { kind?: string })?.kind === 'van',
			onDrop: () => (delivered = id),
		});

	const north_drop = drop_for('north');
	const east_drop = drop_for('east');
	const south_drop = drop_for('south');

	const over = $derived(
		north_drop.isOver ? 'north' : east_drop.isOver ? 'east' : south_drop.isOver ? 'south' : '',
	);

	// Shared depot-block base — repeated on the three depots with per-depot position utilities.
	const block =
		'absolute pointer-events-auto cursor-default rounded-md border-2 border-border bg-panel-strong/90 shadow-inner transition-all duration-150';
</script>

<div class="pg-scene bg-well">
	<div class="last-mile-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div class="pointer-events-none absolute inset-0">
		<span
			class="absolute top-[14%] left-[10%] h-[22%] w-[26%] rounded-lg border-2 border-[#3d9a6a]/75 bg-[#3d9a6a]/45"
			aria-hidden="true"
		></span>
		<span
			class="{block} top-[12%] right-[12%] h-[24%] w-[30%]"
			class:pg-drop-over--success={north_drop.isOver}
			aria-label={LABELS.north}
			{...north_drop.attach}
		></span>
		<span
			class="{block} top-[40%] right-[8%] h-[28%] w-[22%]"
			class:pg-drop-over--success={east_drop.isOver}
			aria-label={LABELS.east}
			{...east_drop.attach}
		></span>
		<span
			class="{block} bottom-[12%] left-[18%] h-[22%] w-[44%]"
			class:pg-drop-over--success={south_drop.isOver}
			aria-label={LABELS.south}
			{...south_drop.attach}
		></span>
		<span
			class="absolute top-[48%] left-[12%] h-1 w-[70%] rounded-full bg-brand/30"
			aria-hidden="true"
		></span>
	</div>
	<p class="pg-scene-kicker">Grid · drop highlight</p>
	<p
		class="pointer-events-none absolute right-3.5 bottom-3 z-10 m-0 max-w-48 text-right font-mono text-xs leading-snug font-bold text-fg-muted"
	>
		{#if over}
			Over {LABELS[over]} — release to deliver
		{:else if delivered}
			✓ Delivered to {LABELS[delivered]}
		{:else}
			Drag the van onto a depot — it snaps to the {step}px grid; the depot lights green.
		{/if}
	</p>
	<button
		type="button"
		class="absolute top-[32%] left-[22%] z-20 grid h-12 w-12 cursor-grab touch-none place-items-center rounded-lg border-2 border-border-strong bg-shell p-0 text-fg shadow-lg active:cursor-grabbing"
		aria-label="Delivery van"
		{...van.attach}
	>
		<span class="text-2xl leading-none" aria-hidden="true">🚐</span>
	</button>
</div>

<style>
	/* Blueprint grid — a 2-layer line gradient, kept as CSS (a single tidy rule beats a 200-char arbitrary value). */
	.last-mile-grid {
		background-image:
			linear-gradient(var(--color-grid-major) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-grid-major) 1px, transparent 1px);
		background-size: 24px 24px;
		opacity: 0.85;
	}
</style>
