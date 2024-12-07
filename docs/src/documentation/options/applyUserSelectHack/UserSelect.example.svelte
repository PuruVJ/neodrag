<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
	import { isDesktop, isMac } from '$helpers/utils';
	import CommandIcon from '~icons/bi/command';
</script>

<OptionsDemoBase options={{ applyUserSelectHack: false }}>
	User Select enabled

	{#snippet caption()}
		{#if isDesktop}
			Hit <kbd>
				{#if isMac}
					<CommandIcon height="1rem" width="1rem" />
				{:else}
					ctrl
				{/if} + A
			</kbd>

			while dragging - Text will be selected
		{/if}
	{/snippet}
</OptionsDemoBase>

<style lang="scss">
	@import './user-select.mixin.scss';

	kbd {
		@include userSelectKBD();
	}
</style>
