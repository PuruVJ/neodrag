<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase size="10rem" options={{ cancel: '.cancel' }}>
	This will drag!

	<br /><br />

	<div class="cancel">This won't drag</div>

	{#snippet caption()}
		Single <code>cancel</code> with selector
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
