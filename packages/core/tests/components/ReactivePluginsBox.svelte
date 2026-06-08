<script lang="ts">
	import { Draggable } from '../../src/draggable-binding.ts';
	import { position } from '../../src/plugins.ts';
	import { bindTarget } from '../bind-target.ts';

	const {
		engine,
		external = null,
	}: {
		engine?: import('../../src/engine/neodrag.ts').Neodrag;
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
		plugins: [
			() => {
				pos.x;
				pos.y;
				return position({ current: pos });
			},
		],
	});

	$effect(() => {
		if (drag.hasReactiveSlots) drag.flushReactive();
	});
</script>

<div class="box" {@attach bindTarget(drag)} data-testid="draggable"></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
