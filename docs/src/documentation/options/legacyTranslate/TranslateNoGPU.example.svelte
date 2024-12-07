<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: false, gpuAcceleration: false }}>
	Modern translate with no GPU acceleration

	{#snippet pos(x, y)}
		<code>translate: {x}px {y}px</code>
	{/snippet}
</OptionsDemoBase>
