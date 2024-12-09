<script lang="ts">
	import Box from '$lib/Box.svelte';

	const { data } = $props();
</script>

<Box testid="draggable" {...data.options}>This is a draggable</Box>
