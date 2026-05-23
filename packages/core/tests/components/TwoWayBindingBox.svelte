<script lang="ts">
	import { Neodrag, events, position, transform } from '../../src/interactions/index.ts';

	const {
		testid = 'draggable',
		engine = new Neodrag(),
		initial = { x: 0, y: 0 },
		external = null,
		twoWay = true,
		onReconcile,
	}: {
		testid?: string;
		engine?: Neodrag;
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

	function attach(node: HTMLElement) {
		const build = () => {
			onReconcile?.();
			const plugins = [
				transform,
				position({ current: { x, y } }),
				...(twoWay
					? [
							events({
								onDrag(data) {
									x = data.offset.x;
									y = data.offset.y;
								},
							}),
						]
					: []),
			];
			return plugins;
		};

		const handle = engine.draggable(node, build());

		return $effect.root(() => {
			$effect.pre(() => {
				handle.update(build());
			});
			return () => handle.destroy();
		});
	}
</script>

<div class="box" {@attach attach} data-testid={testid}></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
