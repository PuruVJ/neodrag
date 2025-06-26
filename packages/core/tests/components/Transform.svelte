<script lang="ts">
	import { wrapper } from '../../../svelte/src/index.svelte';
	import { DEFAULTS, DraggableFactory } from '../../src';
	import type { PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		default_plugins?: (typeof DEFAULTS)['plugins'];
		svg?: boolean;
	};

	const { plugins, default_plugins = DEFAULTS.plugins, svg = false }: Props = $props();

	const factory = new DraggableFactory({
		...DEFAULTS,
		plugins: default_plugins,
	});
	const draggable = wrapper(factory);
</script>

{#if svg}
	<svg width="400" height="400" viewBox="0 0 400 400">
		<circle
			{@attach draggable(plugins)}
			cx="100"
			cy="100"
			r="50"
			fill="blue"
			opacity="0.5"
			data-testid="draggable"
		/>
	</svg>
{:else}
	<Box {plugins} />
{/if}

<style>
	svg {
		border: 1px solid #ccc;
		background: white;
	}
</style>
