<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { position, transform } from '@neodrag/svelte/plugins';

	const { external = { x: 0, y: 0 } }: { external?: { x: number; y: number } } = $props();

	let pos = $state({ ...external });

	$effect.pre(() => {
		pos = { x: external.x, y: external.y };
	});

	const drag = new Draggable({
		plugins: [transform, () => position({ current: pos })],
	});
</script>

<div class="box" {@attach drag.attachment} data-testid="draggable"></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background: cyan;
	}
</style>
