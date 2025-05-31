<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
	import { isDesktop, isMac } from '$helpers/utils';
	import CommandIcon from '~icons/bi/command';
</script>

<OptionsDemoBase options={{ applyUserSelectHack: true }}>
	User Select disabled

	{#snippet caption()}
		{#if isDesktop}
			Hit <kbd>
				{#if isMac}
					<CommandIcon height="1rem" width="1rem" />
				{:else}
					ctrl
				{/if} + A
			</kbd>

			while dragging - Nothing will be selected
		{/if}
	{/snippet}
</OptionsDemoBase>

<style>
	kbd {
		display: flex;
		align-items: center;
		gap: 1ch;

		padding: 0.2rem 0.2rem;

		line-height: 1;
	}
</style>
