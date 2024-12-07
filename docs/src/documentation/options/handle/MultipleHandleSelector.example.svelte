<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<div>
	<OptionsDemoBase size="10rem" options={{ handle: '.handle' }}>
		Won't drag ❌

		<br /><br />

		<div class="handle">Drag me ✅</div>
		<div class="handle">Drag me ✅</div>

		{#snippet caption()}
			Multiple <code>handle</code> with selector
		{/snippet}
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
