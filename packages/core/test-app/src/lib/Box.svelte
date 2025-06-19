<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DraggableFactory, DEFAULTS } from '../../../src';
	import type { Plugin, PluginInput } from '../../../src/plugins';
	import { wrapper } from '../../../../../packages/svelte/src/index.svelte';

	const {
		testid,
		children,
		plugins,
		default_plugins = DEFAULTS.plugins,
	}: {
		plugins?: PluginInput;
		testid: string;
		children?: Snippet;
		default_plugins?: Plugin[];
	} = $props();

	const factory = new DraggableFactory({
		...DEFAULTS,
		plugins: default_plugins,
	});

	// @ts-ignore
	const svelte_one = wrapper(factory);
</script>

<div class="box" {@attach svelte_one(plugins)} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
