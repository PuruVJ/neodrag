<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createEngine, type DragPlugin } from '../../src/interactions/index.ts';

	const {
		testid = 'draggable',
		children,
		plugins = [],
	}: {
		plugins?: DragPlugin[];
		testid?: string;
		children?: Snippet;
	} = $props();

	const engine = createEngine();

	function attach(node: HTMLElement) {
		return engine.draggable(node, plugins);
	}
</script>

<div class="box" {@attach attach} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
