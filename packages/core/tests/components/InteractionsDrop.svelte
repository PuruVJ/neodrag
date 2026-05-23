<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createEngine, type DragPlugin, type DropPlugin } from '../../src/interactions/index.ts';

	const {
		dragPlugins = [],
		dropPlugins = [],
		children,
		dropTestId = 'dropzone',
		dragTestId = 'draggable',
	}: {
		dragPlugins?: DragPlugin[];
		dropPlugins?: DropPlugin[];
		children?: Snippet;
		dropTestId?: string;
		dragTestId?: string;
	} = $props();

	const engine = createEngine();
</script>

<div class="scene">
	<div class="drop" data-testid={dropTestId} {@attach (n) => engine.droppable(n, dropPlugins)}>
		<div class="box" data-testid={dragTestId} {@attach (n) => engine.draggable(n, dragPlugins)}></div>
	</div>
	{@render children?.()}
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
	}
	.drop {
		position: relative;
		width: 100%;
		height: 100%;
		border: 2px dashed #333;
		box-sizing: border-box;
	}
	.box {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 80px;
		height: 80px;
		background: cyan;
	}
</style>
