<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
	import { isDesktop, isMac } from 'src/helpers/utils';
	import CommandIcon from '~icons/bi/command';
</script>

<OptionsDemoBase options={{ applyUserSelectHack: false }}>
	User Select enabled

	<svelte:fragment slot="caption">
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
	</svelte:fragment>
</OptionsDemoBase>

<style lang="scss">
	@import './user-select.mixin.scss';

	kbd {
		@include userSelectKBD();
	}
</style>
