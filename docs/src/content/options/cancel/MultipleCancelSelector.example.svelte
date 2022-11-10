<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase size="10rem" options={{ cancel: '.cancel' }}>
	This will drag!

	<br /><br />

	<div class="cancel">This won't drag</div>
	<div class="cancel">This won't drag</div>
</OptionsDemoBase>

<style lang="scss">
	@import './cancel-base.mixin.scss';

	.cancel {
		@include cancelExample;
	}
</style>
