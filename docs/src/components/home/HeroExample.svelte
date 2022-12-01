<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import RingSVG from './RingSVG.svelte';
</script>

<div use:draggable>
	<RingSVG />
</div>

<style lang="scss">
	div {
		display: grid;
		place-items: center;

		width: 200px;
		height: 200px;

		border-radius: 0.5rem;

		font-size: large;

		& :global(svg) {
			width: 400px;
		}
	}
</style>
