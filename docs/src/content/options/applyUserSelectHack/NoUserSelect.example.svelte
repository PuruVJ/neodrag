<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
	import { isDesktop, isMac } from 'src/helpers/utils';
</script>

<OptionsDemoBase options={{ applyUserSelectHack: true }}>
	User Select disabled

	<svelte:fragment slot="bottom">
		{#if isDesktop}
			Hit <kbd>
				{#if isMac}
					<span style="font-size: 1.3rem;"> &#8984; </span>
				{:else}
					ctrl
				{/if} + A
			</kbd>

			while dragging - Nothing will be selected
		{/if}
	</svelte:fragment>
</OptionsDemoBase>
