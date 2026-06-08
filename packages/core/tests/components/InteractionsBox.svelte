<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Draggable, type DragPluginList } from '../../src/index.ts';
	import { bindTarget } from '../bind-target.ts';

	const {
		testid = 'draggable',
		children,
		plugins = [],
		engine,
	}: {
		plugins?: DragPluginList;
		testid?: string;
		children?: Snippet;
		engine?: import('../../src/engine/neodrag.ts').Neodrag;
	} = $props();

	const drag = new Draggable({ engine, plugins });
</script>

<div class="box" {@attach bindTarget(drag)} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
