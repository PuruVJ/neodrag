<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let handleEl = $state<HTMLDivElement>();
</script>

<div>
	<OptionsDemoBase size="10rem" options={{ handle: handleEl }}>
		Won't drag ❌

		<br /><br />

		<div class="handle" bind:this={handleEl}>Drag me ✅</div>

		{#snippet caption()}
			Single <code>handle</code> with element
		{/snippet}
	</OptionsDemoBase>
</div>

<style>
	@import './handle-base.mixin.scss';

	div :global(.box) {
		color: hsla(var(--app-color-primary-contrast-hsl), 0.7);
	}

	.handle {
		background-color: hsla(var(--app-color-primary-contrast-hsl), 1);

		padding: 0.25rem 0.25rem;

		border-radius: 4px;
	}
</style>
