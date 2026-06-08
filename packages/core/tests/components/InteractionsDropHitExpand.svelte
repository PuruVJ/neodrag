<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { dragData } from '../../src/plugins.ts';
	import { highlight } from '../../src/drop/index.ts';
	import { dropHitExpand } from '../../src/drop-plugins.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	const engine = new Neodrag();
	const bindDrop = stableDroppable(engine, () => [
		dropHitExpand({ top: 40, left: 40, right: 40, bottom: 40 }),
		highlight({ overClass: 'drop-over' }),
	])();

	const bindDrag = stableDraggable(engine, () => [dragData(() => ({ kind: 'chip' }))]);
</script>

<div class="scene">
	<div class="drop" data-testid="dropzone" {@attach bindDrop}></div>
	<div class="box" data-testid="draggable" {@attach bindDrag('chip')}></div>
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
	}
	.drop {
		position: absolute;
		left: 120px;
		top: 80px;
		width: 80px;
		height: 80px;
		border: 2px dashed #333;
		box-sizing: border-box;
	}
	.box {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 50px;
		height: 50px;
		background: cyan;
	}
	:global(.drop-over) {
		background: rgba(0, 255, 0, 0.25);
	}
</style>
