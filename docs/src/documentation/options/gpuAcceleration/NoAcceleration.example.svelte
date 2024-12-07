<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ gpuAcceleration: false }}>
	GPU acceleration off

	{#snippet pos(x, y)}
		<code>transform: translate({x}px, {y}px)</code>
	{/snippet}
</OptionsDemoBase>
