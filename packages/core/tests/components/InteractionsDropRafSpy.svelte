<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { defineDropPlugin } from '../../src/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	let overCalls = $state(0);

	const engine = new Neodrag({ dev: false });
	const spy = defineDropPlugin(() => ({
		key: Symbol('raf-spy-over'),
		over() {
			overCalls++;
		},
	}))();

	const bindDrop = stableDroppable(engine, () => [spy])();
	const bindDrag = stableDraggable(engine, () => []);
</script>

<div class="scene">
	<div class="drop" data-testid="dropzone" {@attach bindDrop}>
		<div class="box" data-testid="draggable" {@attach bindDrag('item')}></div>
	</div>
	<span data-testid="over-count">{overCalls}</span>
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
	}
	.drop {
		position: relative;
		width: 280px;
		height: 220px;
	}
	.box {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 60px;
		height: 60px;
		background: #4a9eff;
		touch-action: none;
	}
</style>
