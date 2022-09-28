<script lang="ts">
	import { draggable } from '@neodrag/svelte';
</script>

<div use:draggable>Drag me</div>

<style>
	div {
		width: 100px;
		height: 100px;
		background: var(--cyan-1);
	}
</style>
