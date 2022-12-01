<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let cancelEl: HTMLDivElement;
</script>

<OptionsDemoBase size="10rem" options={{ cancel: cancelEl }}>
	This will drag!

	<br /><br />

	<div class="cancel" bind:this={cancelEl}>This won't drag</div>

	<svelte:fragment slot="caption">
		Single <code>cancel</code> passed as element.
	</svelte:fragment>
</OptionsDemoBase>

<style lang="scss">
	@import './cancel-base.mixin.scss';

	.cancel {
		@include cancelExample;
	}
</style>
