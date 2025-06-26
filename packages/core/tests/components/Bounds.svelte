<script lang="ts">
	import { bounds, BoundsFrom, type PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		type: 'parent' | 'viewport' | 'element' | 'selector';
		is_smaller_than_element?: boolean;
	};

	const { plugins, type, is_smaller_than_element = false }: Props = $props();

	let element = $state<HTMLElement>();
</script>

<div class="container">
	{#snippet box()}
		<Box
			testid="draggable"
			plugins={type === 'element' && element ? [bounds(BoundsFrom.element(element))] : plugins}
		/>
	{/snippet}

	{#if type === 'parent'}
		<div class="parent">
			{@render box()}
		</div>
	{:else if type === 'viewport'}
		{@render box()}
	{:else if type === 'selector'}
		<div class="selector">
			<div class="selector-child">
				{@render box()}
			</div>
		</div>
	{:else}
		<div class="element" class:smaller={is_smaller_than_element} bind:this={element}>
			{@render box()}
		</div>
	{/if}
</div>

<style>
	.container {
		margin-top: 600px;
	}
	:root {
		--size: 200px;
	}

	.parent {
		width: var(--size);
		height: var(--size);
		background-color: red;
	}

	.selector {
		width: var(--size);
		height: var(--size);
		background-color: yellow;
	}

	.element {
		width: var(--size);
		height: var(--size);
		background-color: green;

		&.smaller {
			width: 90px;
		}
	}
</style>
