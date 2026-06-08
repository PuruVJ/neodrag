<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { dragData } from '../../src/plugins.ts';
	import { highlight } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	const engine = new Neodrag();
	const bindDrop = stableDroppable(engine, () => [highlight({ overClass: 'drop-over' })])();
	const bindDrag = stableDraggable(engine, () => [dragData(() => ({ kind: 'van' }))]);
</script>

<div class="scene">
	<div class="drop" data-testid="dropzone" {@attach bindDrop}></div>
	<div class="box" data-testid="draggable" {@attach bindDrag('van')}></div>
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
		overflow: hidden;
	}
	.drop {
		position: absolute;
		right: 40px;
		top: 60px;
		width: 120px;
		height: 120px;
		border: 2px dashed #333;
		box-sizing: border-box;
	}
	.box {
		position: absolute;
		left: 30px;
		top: 30px;
		width: 70px;
		height: 70px;
		background: cyan;
		transform: translate(40px, 20px);
	}
	:global(.drop-over) {
		outline: 3px solid lime;
	}
</style>
