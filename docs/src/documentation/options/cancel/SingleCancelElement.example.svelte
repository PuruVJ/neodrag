<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let cancel_el = $state<HTMLDivElement>();
</script>

<OptionsDemoBase size="10rem" options={{ cancel: cancel_el }}>
	This will drag!

	<br /><br />

	<div class="cancel" bind:this={cancel_el}>This won't drag</div>

	{#snippet caption()}
		Single <code>cancel</code> passed as element.
	{/snippet}
</OptionsDemoBase>

<style lang="scss">
	@import './cancel-base.mixin.scss';

	.cancel {
		@include cancelExample;
	}
</style>
