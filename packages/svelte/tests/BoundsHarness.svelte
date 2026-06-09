<script lang="ts">
	import { Draggable } from '@neodrag/svelte';

	// Bounded to the parent with a 16px inset on every side.
	const drag = new Draggable({ bounds: { target: 'parent', padding: 16 } });
</script>

<div
	data-testid="parent"
	style="position: relative; width: 300px; height: 200px; margin: 40px; background: #eee;"
>
	<div
		data-testid="box"
		{...drag.attach}
		style="position: absolute; top: 0; left: 0; width: 60px; height: 60px; background: teal; touch-action: none;"
	>
		box
	</div>
</div>
