<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let position = { x: 0, y: 0 };
</script>

<OptionsDemoBase bind:position styledCaption={true}>
	I can be moved with the slider too

	<svelte:fragment slot="caption">
		X: <input type="range" min="0" max="300" bind:value={position.x} />
		&nbsp;&nbsp; Y:
		<input type="range" min="0" max={300} bind:value={position.y} />
	</svelte:fragment>
</OptionsDemoBase>
