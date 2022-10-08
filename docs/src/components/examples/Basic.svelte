<script lang="ts">
	import { draggable } from '@neodrag/svelte';
</script>

<div use:draggable>Drag me</div>

<style>
	div {
		display: grid;
		place-items: center;

		width: 200px;
		height: 200px;

		background: var(--app-color-primary-gradient);
		color: var(--app-color-primary-contrast);

		border-radius: 0.5rem;

		font-size: large;
	}
</style>
