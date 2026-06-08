<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { dragData } from '../../src/plugins.ts';
	import { accepts, collisionPriority, highlight, onDrop } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	let alex_slot = $state<string | null>(null);
	let dropped = $state(false);

	const engine = new Neodrag();

	const bindTray = stableDraggable(engine, () => [dragData(() => ({ id: 'salad' }))]);

	const bindAlexSlot = stableDroppable(engine, () => [
		collisionPriority(10),
		accepts<{ id: string }>((data) => data.id === 'salad'),
		highlight({ overClass: 'drop-over' }),
		onDrop((data) => {
			alex_slot = data.id;
			dropped = true;
		}),
	])();
</script>

<div class="scene">
	<div class="tray">
		{#if !alex_slot}
			<div class="chip" data-testid="tray-chip" {@attach bindTray('salad')}></div>
		{/if}
	</div>
	<div class="slot" data-testid="alex-slot" data-dropped={dropped} {@attach bindAlexSlot}>
		{#if alex_slot}
			<span data-testid="alex-chip">{alex_slot}</span>
		{/if}
	</div>
</div>

<style>
	.scene {
		position: relative;
		width: 420px;
		height: 280px;
	}
	.tray {
		position: absolute;
		left: 20px;
		top: 40px;
		width: 120px;
		height: 160px;
		border: 2px solid #333;
	}
	.chip {
		position: absolute;
		left: 20px;
		top: 30px;
		width: 56px;
		height: 56px;
		background: #8cf;
	}
	.slot {
		position: absolute;
		left: 200px;
		top: 60px;
		width: 140px;
		height: 100px;
		border: 2px dashed #666;
		display: grid;
		place-items: center;
	}
	:global(.drop-over) {
		outline: 3px solid lime;
	}
</style>
