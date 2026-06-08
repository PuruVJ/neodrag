<script lang="ts">
	import { Draggable } from '@neodrag/svelte';

	const drag = new Draggable({ plugins: [] });
</script>

<div data-testid="draggable" {...drag.target}>drag</div>
