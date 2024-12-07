<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: true, gpuAcceleration: false }}>
	Legacy translate with no GPU acceleration

	{#snippet pos(x, y)}
		<code>transform: translate({x}px, {y}px)</code>
	{/snippet}
</OptionsDemoBase>
