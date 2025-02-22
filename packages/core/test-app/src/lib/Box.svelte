<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createDraggable, DEFAULTS, type PluginResolver } from '../../../src';
	import type { Plugin } from '../../../src/plugins';

	const {
		testid,
		children,
		plugins,
		default_plugins = DEFAULTS.plugins,
	}: {
		plugins?: Plugin[] | PluginResolver;
		testid: string;
		children?: Snippet;
		default_plugins?: Plugin[];
	} = $props();

	const { draggable } = createDraggable({
		plugins: default_plugins,
	});
</script>

<div class="box" use:draggable={plugins} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
