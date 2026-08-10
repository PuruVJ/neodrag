<script lang="ts">
	import { Draggable } from '@neodrag/svelte';

	// No `controls` option — the grab point is declared by spreading `handle()` / `cancel()` onto
	// descendants. The bar registers as a handle (drag starts only there), the button as a cancel.
	const drag = new Draggable();
</script>

<div
	data-testid="box"
	style="position: absolute; top: 0; left: 0; width: 200px; height: 220px; background: teal;"
	{...drag.attach}
>
	<div
		data-testid="bar"
		style="height: 50px; background: orange;"
		{...drag.handle()}
	>
		handle
	</div>
	<button data-testid="btn" style="height: 50px; width: 100%;" {...drag.cancel()}>cancel</button>
	<div data-testid="body" style="height: 100px;">body — not a grab point</div>
</div>
