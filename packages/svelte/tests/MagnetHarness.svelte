<script lang="ts">
	import { Draggable, magnetic } from '@neodrag/svelte';

	// One magnet 120px to the right (offset space). Generous radius so the spring engages early;
	// moderate stiffness so a short drag won't fully settle — leaving travel for the settle loop.
	const drag = new Draggable({
		use: [magnetic([{ x: 120, y: 0 }], { radius: 260, spring: { stiffness: 0.3, damping: 0.7 } })],
	});
</script>

<div
	data-testid="box"
	{...drag.attach}
	style="position: absolute; top: 90px; left: 90px; width: 60px; height: 60px; background: rebeccapurple; touch-action: none; user-select: none;"
>
	drag
</div>
