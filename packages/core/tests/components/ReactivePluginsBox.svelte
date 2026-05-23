<script lang="ts">
	import { Neodrag, position, transform } from '../../src/interactions/index.ts';

	const {
		engine = new Neodrag(),
		external = null,
	}: {
		engine?: Neodrag;
		external?: { x: number; y: number } | null;
	} = $props();

	let pos = $state({ x: 0, y: 0 });

	$effect.pre(() => {
		if (external) {
			pos = { x: external.x, y: external.y };
		}
	});

	function attach(node: HTMLElement) {
		const handle = engine.draggable(node, [transform, position({ current: pos })]);

		return $effect.root(() => {
			$effect.pre(() => {
				handle.update([transform, position({ current: pos })]);
			});
			return () => handle.destroy();
		});
	}
</script>

<div class="box" {@attach attach} data-testid="draggable"></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
