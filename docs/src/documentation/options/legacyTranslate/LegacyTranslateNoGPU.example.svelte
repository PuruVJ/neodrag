<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: true, gpuAcceleration: false }}>
	Legacy translate with no GPU acceleration

	<svelte:fragment slot="position" let:x let:y>
		<code>transform: translate({x}px, {y}px)</code>
	</svelte:fragment>
</OptionsDemoBase>
