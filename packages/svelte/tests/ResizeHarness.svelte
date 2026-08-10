<script lang="ts">
	import { Resizable } from '@neodrag/svelte/resize';

	const resize = new Resizable({ minWidth: 40, minHeight: 40 });
</script>

<div
	data-testid="box"
	{...resize.attach}
	style="position: absolute; top: 80px; left: 200px; width: 120px; height: 100px; background: teal;"
>
	<span
		data-testid="w"
		{...resize.handle('w')}
		style="position: absolute; left: -6px; top: 0; width: 12px; height: 100%; cursor: ew-resize;"
	></span>
	<span
		data-testid="e"
		{...resize.handle('e')}
		style="position: absolute; right: -6px; top: 0; width: 12px; height: 100%; cursor: ew-resize;"
	></span>
</div>
