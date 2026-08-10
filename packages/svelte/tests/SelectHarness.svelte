<script lang="ts">
	import { Selectable } from '@neodrag/svelte/select';

	const sel = new Selectable<string>({ box: false });
	export const selected = () => [...sel.selected].sort();
</script>

<div
	data-testid="grid"
	{...sel.container}
	style="position: absolute; top: 0; left: 0; width: 300px; height: 200px;"
>
	<div data-testid="item-a" {...sel.item('a')} style="position: absolute; left: 10px; top: 10px; width: 40px; height: 40px; background: #ccd;"></div>
	<div data-testid="item-b" {...sel.item('b')} style="position: absolute; left: 80px; top: 10px; width: 40px; height: 40px; background: #ccd;"></div>
	<div data-testid="item-c" {...sel.item('c')} style="position: absolute; left: 10px; top: 80px; width: 40px; height: 40px; background: #ccd;"></div>
</div>
