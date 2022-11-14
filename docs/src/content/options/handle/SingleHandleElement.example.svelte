<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let handleEl: HTMLDivElement;
</script>

<div>
	<OptionsDemoBase size="10rem" options={{ handle: handleEl }}>
		Won't drag ❌

		<br /><br />

		<div class="handle" bind:this={handleEl}>Drag me ✅</div>

		<svelte:fragment slot="caption">
			Single <code>handle</code> with element
		</svelte:fragment>
	</OptionsDemoBase>
</div>

<style lang="scss">
	@import './handle-base.mixin.scss';

	div :global(.box) {
		@include box;
	}

	.handle {
		@include handle;
	}
</style>
