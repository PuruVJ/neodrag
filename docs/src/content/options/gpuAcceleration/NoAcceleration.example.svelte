<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase options={{ gpuAcceleration: false }}>
	GPU acceleration off

	<svelte:fragment slot="position" let:x let:y>
		<code>transform: translate({x}px, {y}px)</code>
	</svelte:fragment>
</OptionsDemoBase>
