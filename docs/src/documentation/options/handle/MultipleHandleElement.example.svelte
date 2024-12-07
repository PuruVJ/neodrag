<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';

	let handle1 = $state<HTMLDivElement>();
	let handle2 = $state<HTMLDivElement>();
</script>

<div>
	<OptionsDemoBase size="10rem" options={{ handle: [handle1!, handle2!] }}>
		Won't drag ❌

		<br /><br />

		<div class="handle" bind:this={handle1}>Drag me ✅</div>
		<div class="handle" bind:this={handle2}>Drag me ✅</div>

		{#snippet caption()}
			Multiple <code>handle</code> with element
		{/snippet}
	</OptionsDemoBase>
</div>

<style lang="scss">
	@import './handle-base.mixin.scss';

	div :global(.box) {
		@include box;
	}

	.handle {
		@include handle;
	}
</style>
