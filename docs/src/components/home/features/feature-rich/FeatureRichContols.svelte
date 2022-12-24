<script lang="ts">
	import type { DragOptions } from '@neodrag/svelte';

	export let options: DragOptions;
</script>

<div>
	Axis:
	<select bind:value={options.axis}>
		<option value="both">Both</option>
		<option value="x">X</option>
		<option value="y">Y</option>
	</select>
</div>

<div>
	Grid: {#if options.grid}
		[<input type="number" bind:value={options.grid[0]} />,
		<input type="number" bind:value={options.grid[1]} />]
	{:else}
		<code>undefined</code>
	{/if}
</div>
