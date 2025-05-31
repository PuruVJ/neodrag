<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let handle1 = $state<HTMLDivElement>();
	let handle2 = $state<HTMLDivElement>();
</script>

<div>
	<OptionsDemoBase size="10rem" options={{ handle: [handle1!, handle2!] }}>
		Won't drag ❌

		<br /><br />

		<div class="handle" bind:this={handle1}>Drag me ✅</div>
		<div class="handle" bind:this={handle2}>Drag me ✅</div>

		{#snippet caption()}
			Multiple <code>handle</code> with element
		{/snippet}
	</OptionsDemoBase>
</div>

<style>
	div :global(.box) {
		color: hsla(var(--app-color-primary-contrast-hsl), 0.7);
	}

	.handle {
		background-color: hsla(var(--app-color-primary-contrast-hsl), 1);

		padding: 0.25rem 0.25rem;

		border-radius: 4px;
	}
</style>
