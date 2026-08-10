<script lang="ts">
	import { Rotatable } from '@neodrag/svelte/rotate';

	const rotate = new Rotatable({ origin: 'center' });
</script>

<div
	data-testid="box"
	data-rotating={rotate.isRotating}
	data-angle={Math.round(rotate.angle)}
	{...rotate.attach}
	style="position: absolute; top: 80px; left: 200px; width: 120px; height: 100px; background: teal;"
>
	<span
		data-testid="grip"
		{...rotate.handle('top')}
		style="position: absolute; right: 4px; top: 4px; width: 28px; height: 28px; border-radius: 50%; background: orange; cursor: grab;"
	></span>
</div>
