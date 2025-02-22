<script lang="ts">
	import Box from '$lib/Box.svelte';
	import { axis, Compartment, grid } from '../../../../../src/plugins.js';

	const { data } = $props();

	let axis_val = $state<'x' | 'y'>('x');
	let grid_val = $state<[number, number]>([10, 10]);

	const axis_comp = new Compartment(() => axis(axis_val));
	const grid_comp = new Compartment(() => grid(grid_val));

	$effect(() => {
		if (data.type === 'manual' && data.works_in_manual) {
			axis_comp.current = axis(axis_val);
		}
	});

	$effect(() => {
		if (data.type === 'manual' && data.works_in_manual) {
			grid_comp.current = grid(grid_val);
		}
	});
</script>

{#if data.type === 'auto'}
	<Box testid="draggable" plugins={[axis(axis_val), grid(grid_val)]} />
{:else}
	<Box testid="draggable" plugins={() => [axis_comp, grid_comp]} />
{/if}

<br />

Axis:

<div>
	<label for="x">
		<input type="radio" id="x" bind:group={axis_val} value="x" />
		<span>X</span>
	</label>
	<label for="y">
		<input type="radio" id="y" bind:group={axis_val} value="y" />
		<span>Y</span>
	</label>
</div>

<br /><br />

Grid:

<div>
	<label for="grid_x">
		<input type="number" id="grid_x" bind:value={grid_val[0]} />
		<span>X</span>
	</label>
	<label for="grid_y">
		<input type="number" id="grid_y" bind:value={grid_val[1]} />
		<span>Y</span>
	</label>
</div>
