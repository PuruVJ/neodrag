<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Draggable, type DragPluginList } from '../../src/interactions/index.ts';

	const {
		testid = 'draggable',
		children,
		plugins = [],
		engine,
	}: {
		plugins?: DragPluginList;
		testid?: string;
		children?: Snippet;
		engine?: import('../../src/interactions/engine.ts').Neodrag;
	} = $props();

	const drag = new Draggable({ engine, plugins });
</script>

<div class="box" {@attach drag.attachment} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
