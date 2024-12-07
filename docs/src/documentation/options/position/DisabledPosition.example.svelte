<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let position = $state({ x: 0, y: 0 });
</script>

<OptionsDemoBase
	bind:position
	styledCaption={true}
	options={{ disabled: true }}
>
	I can be moved <i>only</i> with the slider

	{#snippet caption()}
		X: <input type="range" min="0" max="300" bind:value={position.x} />
		&nbsp;&nbsp; Y:
		<input type="range" min="0" max={300} bind:value={position.y} />
	{/snippet}
</OptionsDemoBase>
