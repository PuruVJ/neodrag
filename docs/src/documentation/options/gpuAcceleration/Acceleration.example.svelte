<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ gpuAcceleration: true }}>
	GPU acceleration on

	{#snippet pos(x, y)}
		<code>transform: translate3d({x}px, {y}px, 0)</code>
	{/snippet}
</OptionsDemoBase>
