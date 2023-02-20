<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: false, gpuAcceleration: false }}>
	Modern translate with no GPU acceleration

	<svelte:fragment slot="position" let:x let:y>
		<code>translate: {x}px {y}px</code>
	</svelte:fragment>
</OptionsDemoBase>
