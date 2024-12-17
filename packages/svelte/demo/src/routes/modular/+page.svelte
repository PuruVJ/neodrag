<script lang="ts">
	import { ControlFrom, controls, draggable, events, threshold, position } from '@neodrag/core';

	let element = $state<HTMLElement>();
</script>

<iframe src="https://neodrag.dev" title="iframe" style="height: 90vh; width: 90vw" />
<div
	use:draggable={[
		position({
			// current: {
			// 	x: 200,
			// 	y: 100,
			// },
			default: {
				x: 50,
				y: 65,
			},
		}),
		controls({
			allow: ControlFrom.element('.handle'),
		}),
		events(),
		threshold({
			// delay: 300,
		}),
	]}
	bind:this={element}
	style="width: 100px; height: 100px; background: cyan;position: fixed;z-index: 100; top: 100; left: 100"
>
	Hello

	<br />

	<div class="handle">Handle 1</div>
	<div class="handle">Handle 2</div>
</div>

<style>
	:global {
		body {
			margin: 0;
			height: 50vh;
		}
	}
</style>
