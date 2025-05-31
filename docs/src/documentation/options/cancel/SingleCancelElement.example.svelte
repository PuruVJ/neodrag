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

<style>
	.cancel {
		text-decoration: line-through;
		color: hsla(var(--app-color-primary-contrast-hsl), 0.7);

		background-color: hsla(var(--app-color-primary-contrast-hsl), 0.1);

		padding: 0.25rem 0.25rem;

		border-radius: 4px;

		cursor: not-allowed;
	}
</style>
