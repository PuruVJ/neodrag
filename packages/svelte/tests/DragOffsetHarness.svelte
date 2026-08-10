<script lang="ts">
	import { Draggable } from '@neodrag/svelte';

	const drag = new Draggable();
</script>

<div
	data-testid="box"
	{...drag.attach}
	style="position: absolute; top: 50px; left: 50px; width: 60px; height: 60px; background: teal; touch-action: none;"
>
	box
</div>
<output data-testid="offset">{Math.round(drag.offset.x)},{Math.round(drag.offset.y)}</output>
