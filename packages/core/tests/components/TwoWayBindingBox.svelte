<script lang="ts">
	import { Draggable, events, position } from '../../src/interactions/index.ts';

	const {
		testid = 'draggable',
		engine,
		initial = { x: 0, y: 0 },
		external = null,
		twoWay = true,
		onReconcile,
	}: {
		testid?: string;
		engine?: import('../../src/interactions/engine.ts').Neodrag;
		initial?: { x: number; y: number };
		external?: { x: number; y: number } | null;
		twoWay?: boolean;
		onReconcile?: () => void;
	} = $props();

	let x = $state(initial.x);
	let y = $state(initial.y);

	$effect.pre(() => {
		if (external) {
			x = external.x;
			y = external.y;
		}
	});

	const drag = new Draggable({
		engine,
		plugins: [
				() => {
				onReconcile?.();
				return position({ current: { x, y } });
			},
			...(twoWay
				? [
						() =>
							events({
								onDrag(data) {
									x = data.offset.x;
									y = data.offset.y;
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
