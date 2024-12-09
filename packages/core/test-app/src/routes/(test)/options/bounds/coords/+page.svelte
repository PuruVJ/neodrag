<script>
	import Box from '$lib/Box.svelte';

	const { data } = $props();
</script>

<Box testid="draggable" {...data.options} />
