<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { position } from '@neodrag/svelte/plugins';

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
		plugins: [
			() => {
				pos.x;
				pos.y;
				return position({ current: pos });
			},
		],
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
