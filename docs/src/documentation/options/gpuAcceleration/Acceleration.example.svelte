<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ gpuAcceleration: true }}>
	GPU acceleration on

	<svelte:fragment slot="position" let:x let:y>
		<code>transform: translate3d({x}px, {y}px, 0)</code>
	</svelte:fragment>
</OptionsDemoBase>
