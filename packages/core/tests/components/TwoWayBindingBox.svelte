<script lang="ts">
	import { Draggable } from '../../src/draggable-binding.ts';
	import { position } from '../../src/plugins.ts';
	import { bindTarget } from '../bind-target.ts';

	const {
		testid = 'draggable',
		engine,
		initial = { x: 0, y: 0 },
		external = null,
		twoWay = true,
		onReconcile,
	}: {
		testid?: string;
		engine?: import('../../src/engine/neodrag.ts').Neodrag;
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
		],
		onDrag: twoWay
			? (data) => {
					pos.x = data.offset.x as number;
					pos.y = data.offset.y as number;
				}
			: undefined,
	});

	$effect(() => {
		if (drag.hasReactiveSlots) drag.flushReactive();
	});
</script>

<div class="box" {@attach bindTarget(drag)} data-testid={testid}></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
