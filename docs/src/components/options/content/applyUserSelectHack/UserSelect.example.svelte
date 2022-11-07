<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	const browser = !import.meta.env.SSR;

	const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

	const isDesktop =
		browser && !navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
</script>

<OptionsDemoBase options={{ applyUserSelectHack: false }}>
	User Select enabled

	<svelte:fragment slot="bottom">
		{#if isDesktop}
			Hit <kbd>
				{#if isMac}
					<span style="font-size: 1.3rem;"> &#8984; </span>
				{:else}
					ctrl
				{/if} + A
			</kbd>

			while dragging - Text will be selected
		{/if}
	</svelte:fragment>
</OptionsDemoBase>
