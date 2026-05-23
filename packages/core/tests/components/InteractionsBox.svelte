<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Neodrag, type DragPlugin } from '../../src/interactions/index.ts';

	const {
		testid = 'draggable',
		children,
		plugins = [],
		engine = new Neodrag(),
	}: {
		plugins?: DragPlugin[] | (() => DragPlugin[]);
		testid?: string;
		children?: Snippet;
		engine?: Neodrag;
	} = $props();

	function attach(node: HTMLElement) {
		const list = typeof plugins === 'function' ? plugins() : plugins;
		const handle = engine.draggable(node, list);
		if (typeof plugins === 'function') {
			return $effect.root(() => {
				$effect(() => handle.update(plugins()));
				return () => handle.destroy();
			});
		}
		return () => handle.destroy();
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
