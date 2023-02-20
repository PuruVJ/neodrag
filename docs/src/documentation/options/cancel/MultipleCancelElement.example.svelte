<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let cancel1: HTMLDivElement;
	let cancel2: HTMLDivElement;
</script>

<OptionsDemoBase size="10rem" options={{ cancel: [cancel1, cancel2] }}>
	This will drag!

	<br /><br />

	<div class="cancel" bind:this={cancel1}>This won't drag</div>
	<div class="cancel" bind:this={cancel2}>This won't drag</div>

	<svelte:fragment slot="caption">
		Multiple <code>cancel</code> passed as array of elements.
	</svelte:fragment>
</OptionsDemoBase>

<style lang="scss">
	@import './cancel-base.mixin.scss';

	.cancel {
		@include cancelExample;
	}
</style>
