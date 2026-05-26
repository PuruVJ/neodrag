<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { events, position } from '@neodrag/svelte/plugins';

	const {
		testid = 'draggable',
		engine,
		initial = { x: 0, y: 0 },
		external = null,
		twoWay = true,
		onReconcile,
	}: {
		testid?: string;
		engine?: import('../../src/engine.ts').Neodrag;
		initial?: { x: number; y: number };
		external?: { x: number; y: number } | null;
		twoWay?: boolean;
		onReconcile?: () => void;
	} = $props();

	let pos = $state({ x: initial.x, y: initial.y });

	$effect.pre(() => {
		if (external) {
			pos.x = external.x;
			pos.y = external.y;
		}
	});

	const drag = new Draggable({
		engine,
		plugins: [
			() => {
				onReconcile?.();
				pos.x;
				pos.y;
				return position({ current: pos });
			},
			...(twoWay
				? [
						() =>
							events({
								onDrag(data) {
									pos.x = data.offset.x;
									pos.y = data.offset.y;
								},
							}),
					]
				: []),
		],
	});
</script>

<div class="box" {@attach drag.attachment} data-testid={testid}></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
