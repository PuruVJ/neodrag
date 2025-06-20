<script lang="ts">
	import type { PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		position: { x: number; y: number };
		two_way_binding?: boolean;
	};

	const { plugins, position, two_way_binding = false }: Props = $props();

	// const plugins = $derived.by(() => {
	// 	if (data.options?.two_way_binding) {
	// 		return [
	// 			position({
	// 				current: $state.snapshot(pos),
	// 				default: data.options.current,
	// 			}),
	// 			events({
	// 				onDrag: ({ offset }) => {
	// 					if (pos) {
	// 						pos.x = offset.x;
	// 						pos.y = offset.y;
	// 					}
	// 				},
	// 			}),
	// 		];
	// 	}

	// 	return [
	// 		position({
	// 			default: data.options?.default,
	// 			current: data.options?.current,
	// 		}),
	// 	];
	// });
</script>

<Box {plugins} />

{#if two_way_binding}
	<label>
		X:
		<input type="number" min="0" max="1000" bind:value={position.x} data-testid="x-slider" />
	</label>

	<label>
		Y:
		<input type="number" min="0" max="1000" bind:value={position.y} data-testid="y-slider" />
	</label>
{/if}
