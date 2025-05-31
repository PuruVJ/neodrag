<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let cancel1 = $state<HTMLDivElement>();
	let cancel2 = $state<HTMLDivElement>();
</script>

<OptionsDemoBase size="10rem" options={{ cancel: [cancel1!, cancel2!] }}>
	This will drag!

	<br /><br />

	<div class="cancel" bind:this={cancel1}>This won't drag</div>
	<div class="cancel" bind:this={cancel2}>This won't drag</div>

	{#snippet caption()}
		Multiple <code>cancel</code> passed as array of elements.
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
