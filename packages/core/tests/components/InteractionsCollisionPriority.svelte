<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { dragData } from '../../src/plugins.ts';
	import { accepts, collisionPriority, highlight } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	const engine = new Neodrag();

	const bindOuter = stableDroppable(engine, () => [
		collisionPriority(0),
		accepts<{ zone: string }>(() => true),
		highlight({ overClass: 'drop-over-outer' }),
	])();

	const bindInner = stableDroppable(engine, () => [
		collisionPriority(10),
		accepts<{ zone: string }>(() => true),
		highlight({ overClass: 'drop-over-inner' }),
	])();

	const bindDrag = stableDraggable(engine, () => [dragData(() => ({ zone: 'card' }))]);
</script>

<div class="scene">
	<div class="outer" data-testid="outer-zone" {@attach bindOuter}>
		<div class="inner" data-testid="inner-zone" {@attach bindInner}></div>
	</div>
	<div class="box" data-testid="draggable" {@attach bindDrag('card')}></div>
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
	}
	.outer {
		position: absolute;
		left: 40px;
		top: 40px;
		width: 240px;
		height: 200px;
		border: 2px dashed #666;
	}
	.inner {
		position: absolute;
		left: 60px;
		top: 50px;
		width: 100px;
		height: 80px;
		border: 2px solid #333;
	}
	.box {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 50px;
		height: 50px;
		background: cyan;
	}
	:global(.drop-over-outer) {
		outline: 3px solid orange;
	}
	:global(.drop-over-inner) {
		outline: 3px solid lime;
	}
</style>
