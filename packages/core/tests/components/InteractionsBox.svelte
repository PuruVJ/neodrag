<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createEngine, type DragPlugin, type InteractionEngine } from '../../src/interactions/index.ts';

	const {
		testid = 'draggable',
		children,
		plugins = [],
		engine = createEngine(),
	}: {
		plugins?: DragPlugin[] | (() => DragPlugin[]);
		testid?: string;
		children?: Snippet;
		engine?: InteractionEngine;
	} = $props();

	function attach(node: HTMLElement) {
		const list = typeof plugins === 'function' ? plugins() : plugins;
		const dispose = engine.draggable(node, list);
		if (typeof plugins === 'function') {
			return $effect.root(() => {
				$effect(() => engine.update(node, plugins()));
				return dispose;
			});
		}
		return dispose;
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
