<script lang="ts">
	import { ControlFrom, controls, draggable, events, threshold, position } from '@neodrag/core';

	let element = $state<HTMLElement>();
</script>

<div
	use:draggable={[
		position({
			x: 200,
			y: 100,
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
	style="width: 100px; height: 100px; background: cyan"
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
