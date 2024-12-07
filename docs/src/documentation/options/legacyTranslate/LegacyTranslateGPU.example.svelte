<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: true, gpuAcceleration: true }}>
	Legacy translate with GPU acceleration

	{#snippet pos(x, y)}
		<code>transform: translate3d({x}px, {y}px, 0)</code>
	{/snippet}
</OptionsDemoBase>
