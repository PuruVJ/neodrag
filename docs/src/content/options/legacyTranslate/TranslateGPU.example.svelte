<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ legacyTranslate: false, gpuAcceleration: true }}>
	Modern translate with GPU acceleration

	<svelte:fragment slot="position" let:x let:y>
		<code>translate: {x}px {y}px 1px</code>
	</svelte:fragment>
</OptionsDemoBase>
