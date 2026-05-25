<script lang="ts">
	import { Neodrag, type DragPlugin, type DropPlugin } from '../../src/index.ts';

	const {
		dragPlugins = [],
		outerDropPlugins = [],
		innerDropPlugins = [],
	}: {
		dragPlugins?: DragPlugin[];
		outerDropPlugins?: DropPlugin[];
		innerDropPlugins?: DropPlugin[];
	} = $props();

	const engine = new Neodrag();

	const bindOuterDrop = (n: HTMLElement) => {
		const h = engine.droppable(n, outerDropPlugins);
		return () => h.destroy();
	};
	const bindInnerDrop = (n: HTMLElement) => {
		const h = engine.droppable(n, innerDropPlugins);
		return () => h.destroy();
	};
	const bindDrag = (n: HTMLElement) => {
		const h = engine.draggable(n, dragPlugins);
		return () => h.destroy();
	};
</script>

<div class="scene">
	<div class="outer" data-testid="drop-outer" {@attach bindOuterDrop}>
		<div class="inner" data-testid="drop-inner" {@attach bindInnerDrop}>
			<div class="box" data-testid="draggable" {@attach bindDrag}></div>
		</div>
	</div>
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
	}
	.outer {
		position: relative;
		width: 100%;
		height: 100%;
		border: 2px dashed #333;
		box-sizing: border-box;
	}
	.inner {
		position: absolute;
		left: 40px;
		top: 40px;
		width: 200px;
		height: 160px;
		border: 2px dashed #666;
		box-sizing: border-box;
	}
	.box {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 60px;
		height: 60px;
		background: cyan;
	}
</style>
