<script lang="ts">
	import { bounds, BoundsFrom, type Plugin, type PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		type: 'parent' | 'viewport' | 'element' | 'selector' | 'shouldRecompute-test';
		is_smaller_than_element?: boolean;
		shouldRecompute_scenario?:
			| 'setup'
			| 'start'
			| 'drag'
			| 'end'
			| 'multiple'
			| 'dynamic'
			| 'fallback'
			| 'performance';
	};

	const {
		plugins,
		type,
		is_smaller_than_element = false,
		shouldRecompute_scenario,
	}: Props = $props();

	let element = $state<HTMLElement>();

	// Create shouldRecompute bounds plugins for testing
	const shouldRecompute_bounds = $derived(() => {
		if (type !== 'shouldRecompute-test' || !shouldRecompute_scenario) return null;

		switch (shouldRecompute_scenario) {
			case 'setup': {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};
				return bounds(trackingBounds, (ctx) => ctx.hook === 'setup');
			}

			case 'start': {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};
				return bounds(trackingBounds, (ctx) => ctx.hook === 'start');
			}

			case 'drag': {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};
				return bounds(trackingBounds, (ctx) => ctx.hook === 'drag');
			}

			case 'end': {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};
				return bounds(trackingBounds, (ctx) => ctx.hook === 'end');
			}

			case 'multiple': {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};
				return bounds(
					trackingBounds,
					(ctx) => ctx.hook === 'setup' || ctx.hook === 'start' || ctx.hook === 'drag',
				);
			}

			case 'dynamic': {
				let boundarySize = 200;
				const dynamicBounds = () => {
					// Simulate changing bounds
					if (Math.random() > 0.8) boundarySize = 150;
					return [
						[0, 0],
						[boundarySize, boundarySize],
					] as [[number, number], [number, number]];
				};
				return bounds(dynamicBounds, (ctx) => ctx.hook === 'drag');
			}

			case 'fallback': {
				const customBounds = () =>
					[
						[100, 100], // This should be ignored
						[200, 200],
					] as [[number, number], [number, number]];
				return bounds(customBounds, () => false); // Never recompute
			}

			case 'performance': {
				const performanceBounds = () => {
					// Simulate some calculation work
					let sum = 0;
					for (let i = 0; i < 100; i++) {
						sum += Math.sin(i) * Math.cos(i);
					}
					return [
						[0, 0],
						[window.innerWidth - sum * 0.01, window.innerHeight - sum * 0.01],
					] as [[number, number], [number, number]];
				};
				return bounds(performanceBounds, (ctx) => ctx.hook === 'drag');
			}

			default:
				return null;
		}
	});

	// Determine which plugins to use
	const final_plugins = $derived(() => {
		if (type === 'element' && element) {
			return [bounds(BoundsFrom.element(element))];
		} else if (type === 'shouldRecompute-test' && shouldRecompute_bounds) {
			return [shouldRecompute_bounds];
		} else {
			return plugins as Plugin[];
		}
	});
</script>

{#snippet box()}
	<Box testid="draggable" plugins={final_plugins} />
{/snippet}

<div class="container">
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
	{:else if type === 'shouldRecompute-test'}
		<!-- Use viewport container for shouldRecompute tests -->
		{@render box()}
	{:else}
		<div class={['element', is_smaller_than_element && 'smaller']} bind:this={element}>
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

	.selector-child {
		width: 100%;
		height: 100%;
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
