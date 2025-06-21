<script lang="ts">
	import type { PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		onclick: () => void;
	};

	const { plugins, onclick }: Props = $props();
</script>

<Box {plugins}></Box>

<button {onclick} data-testid="switcheroo">Switch</button>
