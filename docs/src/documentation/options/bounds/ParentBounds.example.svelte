<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<div>
	<OptionsDemoBase options={{ bounds: 'parent' }}>
		Can't go outside the parent element
	</OptionsDemoBase>
</div>

<style>
	div :global(.parent) {
		width: 90%;
		height: 70%;

		border: var(--app-color-dark) solid 2px;

		border-radius: 0;
	}
</style>
