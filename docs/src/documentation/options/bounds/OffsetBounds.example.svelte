<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<div>
	<OptionsDemoBase options={{ bounds: { element: 'parent', offsets: { top: -30, left: -30, bottom: -30, right: -30 } } }}>
		Offset by:
		<code>
			top: -30
			<br />
			left: -30
			<br />
			bottom: -30
			<br />
			right: -30
		</code>

		{#snippet caption()}
			Can overflow outside parent by 30px on all sides due to negative offsets.
		{/snippet}
	</OptionsDemoBase>
</div>

<style lang="scss">
	div :global(.parent) {
		width: 90%;
		height: 70%;

		border: var(--app-color-dark) solid 2px;

		border-radius: 0;
	}
</style>