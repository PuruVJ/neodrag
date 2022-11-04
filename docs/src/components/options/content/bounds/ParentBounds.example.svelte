<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<div style="display: contents">
	<OptionsDemoBase options={{ bounds: 'parent' }}>
		Can't go outside the parent element
	</OptionsDemoBase>
</div>

<style lang="scss">
	div :global(.parent) {
		width: 90%;
		height: 70%;

		border: var(--app-color-dark) solid 2px;
	}
</style>
