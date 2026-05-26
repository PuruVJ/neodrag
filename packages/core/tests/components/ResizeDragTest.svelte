<script lang="ts">
	import { Length, Neodrag } from '../../src/index.ts';
	import { controls, ControlFrom } from '../../src/plugins.ts';
	import { resizeHandles, sizeBounds } from '../../src/resize/index.ts';
	import { onMount } from 'svelte';

	let card: HTMLDivElement;
	const engine = new Neodrag({ dev: false });

	onMount(() => {
		engine.resizable(card, [resizeHandles({ edges: ['e'], size: 12 }), sizeBounds({ minWidth: 80 })], {
			length: new Length(),
		});
		engine.draggable(card, [controls({ allow: ControlFrom.selector('[data-drag-handle]') })]);
		return () => engine.dispose();
	});
</script>

<div
	bind:this={card}
	data-testid="card"
	style="position:absolute;left:40px;top:40px;width:160px;height:80px;background:#8cf"
>
	<div data-drag-handle style="height:24px;background:#48a;cursor:grab">drag</div>
</div>
