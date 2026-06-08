<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable } from '@neodrag/svelte';
	import { Droppable, accepts, highlight } from '@neodrag/svelte/drop';
	import { bounds, BoundsFrom, dragData, grid } from '@neodrag/svelte/plugins';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	const step = 24;

	const van = new Draggable({
		plugins: [
			bounds(BoundsFrom.parent()),
			grid([step, step]),
			dragData(() => ({ kind: 'van' })),
		],
		threshold: null,
	});

	const drop_for = () =>
		new Droppable({
			plugins: [
				accepts<{ kind: string }>((data) => data.kind === 'van'),
				highlight({ overClass: 'pg-drop-over pg-drop-over--success' }),
			],
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
			aria-label={zone_label('north')}
			{@attach north_drop.attachment}
			onmouseenter={() => (active_zone = 'north')}
			onmouseleave={() => (active_zone = '')}
		></span>
		<span
			class="last-mile-block last-mile-block--east"
			aria-label={zone_label('east')}
			{@attach east_drop.attachment}
			onmouseenter={() => (active_zone = 'east')}
			onmouseleave={() => (active_zone = '')}
		></span>
		<span
			class="last-mile-block last-mile-block--south"
			aria-label={zone_label('south')}
			{@attach south_drop.attachment}
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
	<button type="button" class="last-mile-van" aria-label="Delivery van" {@attach van.attachment}>
		<span class="last-mile-van-icon" aria-hidden="true">🚐</span>
	</button>
</div>
