<script lang="ts">
	import { PanZoom } from '@neodrag/svelte/panzoom';

	const pz = new PanZoom({ minScale: 0.2, maxScale: 5 });
	export const transform = () => pz.transform;
	export const api = pz;
</script>

<div
	data-testid="viewport"
	{...pz.viewport}
	style="position: absolute; top: 0; left: 0; width: 300px; height: 200px;"
>
	<div
		data-testid="world"
		{...pz.world}
		style="position: absolute; top: 0; left: 0; width: 1000px; height: 1000px;"
	>
		<div data-testid="node" style="position: absolute; left: 100px; top: 100px; width: 40px; height: 40px; background: #ccd;"></div>
	</div>
</div>
