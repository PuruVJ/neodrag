<script lang="ts">
	import { Draggable, position, transform } from '../../src/interactions/index.ts';

	const {
		engine,
		external = null,
	}: {
		engine?: import('../../src/interactions/engine.ts').Neodrag;
		external?: { x: number; y: number } | null;
	} = $props();

	let pos = $state({ x: 0, y: 0 });

	$effect.pre(() => {
		if (external) {
			pos = { x: external.x, y: external.y };
		}
	});

	const drag = new Draggable({
		engine,
		plugins: [transform, () => position({ current: pos })],
	});
</script>

<div class="box" {@attach drag.attachment} data-testid="draggable"></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
