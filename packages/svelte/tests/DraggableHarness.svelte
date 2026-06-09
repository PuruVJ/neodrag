<script lang="ts">
	import { Draggable } from '@neodrag/svelte';

	const drag = new Draggable();
</script>

<div
	data-testid="draggable"
	data-dragging={drag.isDragging}
	style="position: absolute; top: 0; left: 0; width: 100px; height: 100px; background: rebeccapurple;"
	{...drag.attach}
>
	drag me
</div>
