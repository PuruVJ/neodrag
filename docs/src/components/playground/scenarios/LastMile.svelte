<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable, Droppable } from '@neodrag/svelte';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	const step = 24;

	const van = new Draggable({
		bounds: 'parent',
		grid: [step, step],
		dragData: { kind: 'van' },
		threshold: 0,
	});

	const drop_for = () =>
		new Droppable({
			accepts: ({ data }) => (data as { kind?: string })?.kind === 'van',
		});

	const north_drop = drop_for();
	const east_drop = drop_for();
	const south_drop = drop_for();

	let active_zone = $state('');

	function zone_label(id: string) {
		if (id === 'north') return 'North depot';
		if (id === 'east') return 'East depot';
		return 'South depot';
	}
</script>

<div class="pg-scene last-mile">
	<div class="last-mile-grid" aria-hidden="true"></div>
	<div class="last-mile-city">
		<span class="last-mile-park" aria-hidden="true"></span>
		<span
			class="last-mile-block last-mile-block--north"
			class:pg-drop-over={north_drop.isOver}
			class:pg-drop-over--success={north_drop.isOver}
			aria-label={zone_label('north')}
			{...north_drop.attach}
			onmouseenter={() => (active_zone = 'north')}
			onmouseleave={() => (active_zone = '')}
		></span>
		<span
			class="last-mile-block last-mile-block--east"
			class:pg-drop-over={east_drop.isOver}
			class:pg-drop-over--success={east_drop.isOver}
			aria-label={zone_label('east')}
			{...east_drop.attach}
			onmouseenter={() => (active_zone = 'east')}
			onmouseleave={() => (active_zone = '')}
		></span>
		<span
			class="last-mile-block last-mile-block--south"
			class:pg-drop-over={south_drop.isOver}
			class:pg-drop-over--success={south_drop.isOver}
			aria-label={zone_label('south')}
			{...south_drop.attach}
			onmouseenter={() => (active_zone = 'south')}
			onmouseleave={() => (active_zone = '')}
		></span>
		<span class="last-mile-route" aria-hidden="true"></span>
	</div>
	<p class="pg-scene-kicker">Grid · drop highlight</p>
	<p class="last-mile-readout">
		{#if active_zone}
			{zone_label(active_zone)} — delivery zone active
		{:else}
			Drag the van over a block — it lights up green.
		{/if}
	</p>
	<button type="button" class="last-mile-van" aria-label="Delivery van" {...van.attach}>
		<span class="last-mile-van-icon" aria-hidden="true">🚐</span>
	</button>
</div>
