<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: false, gpuAcceleration: true }}>
	Modern translate with GPU acceleration

	{#snippet pos(x, y)}
		<code>translate: {x}px {y}px 1px</code>
	{/snippet}
</OptionsDemoBase>
